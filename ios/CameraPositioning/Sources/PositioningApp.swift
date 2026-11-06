import SwiftUI
import UniformTypeIdentifiers

@main
struct PositioningApp: App {
    var body: some Scene {
        WindowGroup { PositioningView() }
    }
}

private struct PositioningDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data

    init(data: Data) { self.data = data }
    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents else {
            throw CocoaError(.fileReadCorruptFile)
        }
        self.data = data
    }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: data)
    }
}

struct PositioningView: View {
    @StateObject private var positioning = PositioningController()
    @State private var document: PositioningDocument?
    @State private var exporting = false
    @State private var exportError: String?

    var body: some View {
        NavigationStack {
            List {
                Section("Setup") {
                    Text("Use this app on three supported iPhones. Give each camera a distinct name. Keep the apps open while positioning; switch to Safari afterward to record.")
                    TextField("Camera name", text: $positioning.cameraName)
                        .disabled(positioning.isRunning)
                    if positioning.isRunning {
                        Button("Stop and clear session", role: .destructive) { positioning.stop() }
                    } else {
                        Button("Start nearby discovery") { positioning.start() }
                            .disabled(!positioning.supported)
                    }
                    Text(positioning.status)
                    Text("UWB support is checked on this device. Distance and direction can be unavailable or obstructed. This does not synchronize video, measure camera aim, or provide a shared 3D coordinate system.")
                        .font(.footnote)
                }
                Section("Nearby cameras — tap to connect") {
                    ForEach(positioning.discovered, id: \.self) { peer in
                        Button(peer.displayName) { positioning.connect(peer) }
                            .disabled(positioning.connections.count >= 2 || positioning.connections[peer] != nil)
                    }
                }
                Section("Relative measurements") {
                    TimelineView(.periodic(from: .now, by: 1)) { context in
                        ForEach(positioning.connections.keys.sorted(by: { $0.displayName < $1.displayName }), id: \.self) { peer in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(peer.displayName).font(.headline)
                                Text(positioning.connections[peer] ?? "")
                                if let sample = positioning.samples[peer] {
                                    if context.date.timeIntervalSince(sample.receivedAt) <= 2 {
                                        Text(sample.distance.map { String(format: "Distance: %.2f m", $0) } ?? "Distance unavailable")
                                        if let direction = sample.direction {
                                            Text(String(format: "Device-relative direction: x %.2f, y %.2f, z %.2f", direction[0], direction[1], direction[2]))
                                        } else {
                                            Text("Direction unavailable")
                                        }
                                    } else {
                                        Text("Measurement stale — do not use for positioning.")
                                    }
                                }
                                Button("Retry ranging") { positioning.retry(peer) }
                            }
                        }
                    }
                    Text("Point each phone toward its peer and maintain a clear path if ranging is unavailable. Direction is relative to the measuring device, not a global camera orientation. Use the web grid and a shared physical marker to aim the cameras.")
                        .font(.footnote)
                }
                Section("Local snapshot") {
                    Button("Export positioning JSON") {
                        do {
                            document = PositioningDocument(data: try positioning.snapshot())
                            exporting = true
                        } catch {
                            exportError = error.localizedDescription
                        }
                    }
                    .disabled(positioning.samples.isEmpty)
                    Text("Exports the latest measurements and their age, not a recording or calibration. Files are shared only when you choose. Stop clears measurements from this app.")
                        .font(.footnote)
                }
            }
            .navigationTitle("KickIt camera setup")
            .alert("Allow nearby camera?", isPresented: Binding(
                get: { positioning.invitationName != nil },
                set: { if !$0 { positioning.respondToInvitation(false) } }
            )) {
                Button("Accept") { positioning.respondToInvitation(true) }
                Button("Reject", role: .cancel) { positioning.respondToInvitation(false) }
            } message: {
                Text("Connect to \(positioning.invitationName ?? "")? Confirm the name with the other phone's owner; names are not verified identities.")
            }
            .alert("Export failed", isPresented: Binding(
                get: { exportError != nil }, set: { if !$0 { exportError = nil } }
            )) {
                Button("OK") { exportError = nil }
            } message: { Text(exportError ?? "") }
            .fileExporter(isPresented: $exporting, document: document, contentType: .json,
                          defaultFilename: "kickit-camera-positioning") { result in
                if case .failure(let error) = result { exportError = error.localizedDescription }
            }
        }
    }
}
