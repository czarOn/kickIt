import Foundation
import Combine
import MultipeerConnectivity
import NearbyInteraction
import UIKit

struct PositionSample: Codable {
    let receivedAt: Date
    let distance: Float?
    let direction: [Float]?
}

@MainActor
final class PositioningController: NSObject, ObservableObject {
    @Published var cameraName = "Camera"
    @Published private(set) var isRunning = false
    @Published private(set) var status = "Start discovery on each phone, then connect to the other two."
    @Published private(set) var discovered: [MCPeerID] = []
    @Published private(set) var connections: [MCPeerID: String] = [:]
    @Published private(set) var samples: [MCPeerID: PositionSample] = [:]
    @Published private(set) var invitationName: String?

    let supported = NISession.deviceCapabilities.supportsPreciseDistanceMeasurement
    private let service = "kickit-uwb"
    private var transport: MCSession?
    private var advertiser: MCNearbyServiceAdvertiser?
    private var browser: MCNearbyServiceBrowser?
    private var ranging: [MCPeerID: NISession] = [:]
    private var peerTokens: [MCPeerID: NIDiscoveryToken] = [:]
    private var invitation: ((Bool, MCSession?) -> Void)?
    private var invitedPeer: MCPeerID?
    private var foregroundObserver: NSObjectProtocol?

    override init() {
        super.init()
        if !supported { status = "This device does not support precise UWB distance measurement." }
        foregroundObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.willResignActiveNotification, object: nil, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                guard let self, self.isRunning else { return }
                self.stop()
                self.status = "Positioning stopped when the app left the foreground. Start discovery again to reconnect."
            }
        }
    }

    func start() {
        guard supported, !isRunning else { return }
        let name = cameraName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty, name.utf8.count <= 63 else {
            status = "Enter a camera name between 1 and 63 UTF-8 bytes."
            return
        }
        let peer = MCPeerID(displayName: name)
        let session = MCSession(peer: peer, securityIdentity: nil, encryptionPreference: .required)
        session.delegate = self
        transport = session
        advertiser = MCNearbyServiceAdvertiser(peer: peer, discoveryInfo: nil, serviceType: service)
        advertiser?.delegate = self
        browser = MCNearbyServiceBrowser(peer: peer, serviceType: service)
        browser?.delegate = self
        isRunning = true
        advertiser?.startAdvertisingPeer()
        browser?.startBrowsingForPeers()
        status = "Discovering nearby cameras. Accept connections only from your own devices."
    }

    func stop() {
        isRunning = false
        respondToInvitation(false)
        advertiser?.stopAdvertisingPeer()
        browser?.stopBrowsingForPeers()
        transport?.disconnect()
        ranging.values.forEach { $0.invalidate() }
        ranging.removeAll()
        peerTokens.removeAll()
        samples.removeAll()
        connections.removeAll()
        discovered.removeAll()
        advertiser = nil
        browser = nil
        transport = nil
        status = "Stopped. Measurements cleared."
    }

    func connect(_ peer: MCPeerID) {
        guard let transport, connections.count < 2, connections[peer] == nil else { return }
        connections[peer] = "Connecting…"
        browser?.invitePeer(peer, to: transport, withContext: nil, timeout: 20)
    }

    func respondToInvitation(_ accept: Bool) {
        let handler = invitation
        let accepted = accept && isRunning && connections.count < 2
        if accepted, let peer = invitedPeer {
            connections[peer] = "Connecting…"
        }
        invitation = nil
        invitationName = nil
        invitedPeer = nil
        handler?(accepted, accepted ? transport : nil)
    }

    private func rangingSession(for peer: MCPeerID) -> NISession {
        if let existing = ranging[peer] { return existing }
        let session = NISession()
        session.delegate = self
        ranging[peer] = session
        return session
    }

    private func sendToken(to peer: MCPeerID) {
        guard let transport, transport.connectedPeers.contains(peer) else { return }
        let session = rangingSession(for: peer)
        if let peerToken = peerTokens[peer] {
            session.run(NINearbyPeerConfiguration(peerToken: peerToken))
        }
        guard let token = session.discoveryToken else {
            connections[peer] = "UWB discovery token unavailable. Retry ranging."
            return
        }
        do {
            let data = try NSKeyedArchiver.archivedData(withRootObject: token, requiringSecureCoding: true)
            try transport.send(data, toPeers: [peer], with: .reliable)
        } catch {
            connections[peer] = "Token exchange failed: \(error.localizedDescription)"
        }
    }

    func retry(_ peer: MCPeerID) {
        guard transport?.connectedPeers.contains(peer) == true else {
            status = "Peer disconnected. Discover and connect again."
            return
        }
        samples.removeValue(forKey: peer)
        connections[peer] = "Exchanging tokens…"
        // Keep a valid session so both peers retain each other's discovery token.
        sendToken(to: peer)
    }

    func snapshot() throws -> Data {
        struct Entry: Encodable {
            let peerName: String
            let sample: PositionSample
            let ageSeconds: TimeInterval
            let stale: Bool
        }
        struct Snapshot: Encodable {
            let format = "kickit-camera-positioning"
            let version = 1
            let capturedAt: Date
            let cameraName: String
            let coordinates = "direction is a device-relative unit vector, not shared world coordinates; distance is meters"
            let peers: [Entry]
        }
        let now = Date()
        let entries = samples.map { peer, sample in
            let age = now.timeIntervalSince(sample.receivedAt)
            return Entry(peerName: peer.displayName, sample: sample, ageSeconds: age, stale: age > 2)
        }.sorted { $0.peerName < $1.peerName }
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return try encoder.encode(Snapshot(capturedAt: now, cameraName: cameraName, peers: entries))
    }
}

extension PositioningController: MCNearbyServiceBrowserDelegate, MCNearbyServiceAdvertiserDelegate {
    nonisolated func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID,
                             withDiscoveryInfo info: [String: String]?) {
        Task { @MainActor in
            guard self.browser === browser, !self.discovered.contains(peerID) else { return }
            self.discovered.append(peerID)
        }
    }

    nonisolated func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
        Task { @MainActor in
            guard self.browser === browser else { return }
            self.discovered.removeAll { $0 == peerID }
        }
    }

    nonisolated func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID,
                                withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
        Task { @MainActor in
            guard self.advertiser === advertiser, self.isRunning, self.invitation == nil,
                  self.connections.count < 2 else {
                invitationHandler(false, nil)
                return
            }
            self.invitationName = peerID.displayName
            self.invitedPeer = peerID
            self.invitation = invitationHandler
        }
    }

    nonisolated func browser(_ browser: MCNearbyServiceBrowser, didNotStartBrowsingForPeers error: Error) {
        Task { @MainActor in
            guard self.browser === browser else { return }
            self.stop()
            self.status = "Discovery failed: \(error.localizedDescription). Check Local Network permission in Settings."
        }
    }

    nonisolated func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didNotStartAdvertisingPeer error: Error) {
        Task { @MainActor in
            guard self.advertiser === advertiser else { return }
            self.stop()
            self.status = "Advertising failed: \(error.localizedDescription). Check Local Network permission in Settings."
        }
    }
}

extension PositioningController: MCSessionDelegate {
    nonisolated func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
        Task { @MainActor in
            guard self.transport === session else { return }
            switch state {
            case .connected:
                guard self.connections[peerID] != nil || self.connections.count < 2 else {
                    self.stop()
                    self.status = "Too many cameras connected. Restart with only two peers per phone."
                    return
                }
                self.connections[peerID] = "Waiting for UWB measurements…"
                self.sendToken(to: peerID)
            case .connecting:
                guard self.connections[peerID] != nil || self.connections.count < 2 else {
                    self.stop()
                    self.status = "Too many cameras connecting. Restart with only two peers per phone."
                    return
                }
                self.connections[peerID] = "Connecting…"
            case .notConnected:
                self.ranging.removeValue(forKey: peerID)?.invalidate()
                self.peerTokens.removeValue(forKey: peerID)
                self.samples.removeValue(forKey: peerID)
                self.connections.removeValue(forKey: peerID)
                self.status = "\(peerID.displayName) disconnected or did not accept. Tap its name to reconnect."
            @unknown default:
                self.status = "Unknown connection state. Stop and restart discovery."
            }
        }
    }

    nonisolated func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
        Task { @MainActor in
            guard self.transport === session, session.connectedPeers.contains(peerID) else { return }
            do {
                guard data.count <= 65_536,
                      let token = try NSKeyedUnarchiver.unarchivedObject(ofClass: NIDiscoveryToken.self, from: data) else {
                    self.connections[peerID] = "Invalid UWB token received."
                    return
                }
                self.samples.removeValue(forKey: peerID)
                self.peerTokens[peerID] = token
                self.rangingSession(for: peerID).run(NINearbyPeerConfiguration(peerToken: token))
                self.connections[peerID] = "Ranging — keep a clear path between phones."
            } catch {
                self.connections[peerID] = "Could not read UWB token: \(error.localizedDescription)"
            }
        }
    }

    nonisolated func session(_ session: MCSession, didReceive stream: InputStream,
                             withName streamName: String, fromPeer peerID: MCPeerID) { stream.close() }
    nonisolated func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String,
                             fromPeer peerID: MCPeerID, with progress: Progress) { progress.cancel() }
    nonisolated func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String,
                             fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}
}

extension PositioningController: NISessionDelegate {
    nonisolated func session(_ session: NISession, didUpdate nearbyObjects: [NINearbyObject]) {
        Task { @MainActor in
            guard let peer = self.ranging.first(where: { $0.value === session })?.key,
                  let object = nearbyObjects.first else { return }
            let distance: Float? = object.distance.flatMap { $0.isFinite && $0 >= 0 ? $0 : nil }
            let direction = object.direction.flatMap { vector -> [Float]? in
                let values = [vector.x, vector.y, vector.z]
                return values.allSatisfy(\.isFinite) ? values : nil
            }
            self.samples[peer] = PositionSample(receivedAt: Date(), distance: distance, direction: direction)
            self.connections[peer] = distance == nil ? "Distance unavailable — adjust the phones." : "Live UWB measurement"
        }
    }

    nonisolated func sessionWasSuspended(_ session: NISession) {
        Task { @MainActor in
            guard let peer = self.ranging.first(where: { $0.value === session })?.key else { return }
            self.samples.removeValue(forKey: peer)
            self.connections[peer] = "UWB suspended. Keep the app in the foreground."
        }
    }

    nonisolated func sessionSuspensionEnded(_ session: NISession) {
        Task { @MainActor in
            guard let peer = self.ranging.first(where: { $0.value === session })?.key else { return }
            self.retry(peer)
        }
    }

    nonisolated func session(_ session: NISession, didInvalidateWith error: Error) {
        Task { @MainActor in
            guard let peer = self.ranging.first(where: { $0.value === session })?.key else { return }
            self.ranging.removeValue(forKey: peer)
            self.samples.removeValue(forKey: peer)
            self.connections[peer] = "UWB failed: \(error.localizedDescription). Check Nearby Interactions permission, then retry."
        }
    }

    nonisolated func session(_ session: NISession, didRemove nearbyObjects: [NINearbyObject],
                             reason: NINearbyObject.RemovalReason) {
        Task { @MainActor in
            guard let peer = self.ranging.first(where: { $0.value === session })?.key else { return }
            self.samples.removeValue(forKey: peer)
            if reason == .peerEnded {
                self.ranging.removeValue(forKey: peer)?.invalidate()
                self.peerTokens.removeValue(forKey: peer)
            }
            self.connections[peer] = "Peer out of range or session ended. Retry ranging on both phones."
        }
    }
}
