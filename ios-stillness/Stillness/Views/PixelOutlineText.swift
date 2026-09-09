//
//  PixelOutlineText.swift
//  Stillness
//

import SwiftUI

/// Bitmap text with a hard pixel outline, the way 16-bit games drew titles.
struct PixelOutlineText: View {
    let text: String
    let font: Font
    var fill: Color = PixelTheme.canvas
    var outline: Color = PixelTheme.ink
    var thickness: CGFloat = 4

    private struct Shift: Hashable {
        let x: CGFloat
        let y: CGFloat
    }

    private var shifts: [Shift] {
        [
            Shift(x: -1, y: 0), Shift(x: 1, y: 0), Shift(x: 0, y: -1), Shift(x: 0, y: 1),
            Shift(x: -1, y: -1), Shift(x: 1, y: -1), Shift(x: -1, y: 1), Shift(x: 1, y: 1),
        ]
    }

    var body: some View {
        ZStack {
            ForEach(shifts, id: \.self) { shift in
                Text(text)
                    .font(font)
                    .foregroundStyle(outline)
                    .offset(x: shift.x * thickness, y: shift.y * thickness)
            }
            Text(text)
                .font(font)
                .foregroundStyle(fill)
        }
        .accessibilityElement()
        .accessibilityLabel(text)
    }
}

#Preview {
    VStack(spacing: 24) {
        PixelOutlineText(text: "STILLNESS", font: PixelFont.display(34))
        PixelOutlineText(text: "30", font: PixelFont.display(44), fill: PixelTheme.blood, thickness: 3)
    }
    .padding()
    .background(PixelTheme.canvas)
}
