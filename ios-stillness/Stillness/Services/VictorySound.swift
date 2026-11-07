//
//  VictorySound.swift
//  Stillness
//

import AVFoundation

/// Plays the bundled 16-bit victory fanfare (`victory.wav`).
/// Uses the ambient session so it respects the silent switch and mixes with other audio.
@MainActor
final class VictorySound {
    static let shared = VictorySound()

    private var player: AVAudioPlayer?

    private init() {
        guard let url = Bundle.main.url(forResource: "victory", withExtension: "wav") else {
            print("VictorySound: victory.wav missing from bundle")
            return
        }
        do {
            try AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
            let player = try AVAudioPlayer(contentsOf: url)
            player.volume = 0.9
            player.prepareToPlay()
            self.player = player
        } catch {
            print("VictorySound: could not prepare sound — \(error.localizedDescription)")
        }
    }

    func play() {
        guard let player else { return }
        try? AVAudioSession.sharedInstance().setActive(true)
        player.currentTime = 0
        player.play()
    }
}
