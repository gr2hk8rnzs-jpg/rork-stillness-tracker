//
//  StillnessApp.swift
//  Stillness
//

import SwiftUI

@main
struct StillnessApp: App {
    @State private var store = StillnessStore()

    init() {
        PixelFont.registerAll()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
                .preferredColorScheme(.light)
        }
    }
}
