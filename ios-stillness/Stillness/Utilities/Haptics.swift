//
//  Haptics.swift
//  Stillness
//

import UIKit

/// Small wrapper around UIKit feedback so the arcade interactions feel physical.
enum Haptics {
    static func tap() {
        UIImpactFeedbackGenerator(style: .rigid).impactOccurred(intensity: 0.7)
    }

    static func step() {
        UISelectionFeedbackGenerator().selectionChanged()
    }

    /// Rising triple thump used for the victory flourish.
    static func victory() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.prepare()
        for index in 0..<3 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.16 * Double(index + 1)) {
                generator.impactOccurred(intensity: 0.6 + 0.2 * Double(index))
            }
        }
    }
}
