//
//  PixelTheme.swift
//  Stillness
//

import CoreText
import SwiftUI

/// Palette and typography tokens for the 16-bit console look.
/// Flat colors only — no gradients, no blurs, no soft shadows.
nonisolated enum PixelTheme {
    /// Page canvas.
    static let canvas = Color(red: 1.0, green: 1.0, blue: 1.0)
    /// Elevated panel surface.
    static let surface = Color(red: 0.961, green: 0.961, blue: 0.961)
    /// Primary ink used for borders and text.
    static let ink = Color(red: 0.067, green: 0.067, blue: 0.067)
    /// Health bar fill / hero accent.
    static let blood = Color(red: 0.902, green: 0.0, blue: 0.071)
    /// Playful secondary accent used for celebration.
    static let flame = Color(red: 1.0, green: 0.302, blue: 0.0)
    /// Sparkle highlight.
    static let gold = Color(red: 1.0, green: 0.769, blue: 0.0)
    /// Metal grey used for the slider grip.
    static let steel = Color(red: 0.839, green: 0.839, blue: 0.839)

    /// Standard black pixel border width.
    static let border: CGFloat = 4
    /// Corner notch size that fakes 16-bit "rounded" corners.
    static let notch: CGFloat = 6
    /// Hard (non-blurred) drop offset for pressable chrome.
    static let dropOffset: CGFloat = 6
}

/// Bundled bitmap fonts, registered at launch so no Info.plist entry is needed.
nonisolated enum PixelFont {
    private static let displayName = "PressStart2P-Regular"
    private static let labelName = "Silkscreen-Bold"
    private static let labelRegularName = "Silkscreen-Regular"

    /// Registers the bundled TTFs with CoreText. Safe to call more than once.
    static func registerAll() {
        for name in [displayName, labelRegularName, labelName] {
            guard let url = Bundle.main.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }

    /// Chunky arcade display face for titles, numerals and banners.
    static func display(_ size: CGFloat) -> Font {
        .custom(displayName, fixedSize: size)
    }

    /// Compact bitmap face for labels and list rows.
    static func label(_ size: CGFloat) -> Font {
        .custom(labelName, fixedSize: size)
    }

    /// Compact bitmap face, lighter weight.
    static func labelRegular(_ size: CGFloat) -> Font {
        .custom(labelRegularName, fixedSize: size)
    }
}
