//
//  PixelStar.swift
//  Stillness
//

import SwiftUI

/// A hand-plotted pixel sparkle drawn on a fixed grid, so it stays blocky at
/// any size instead of turning into a smooth vector star.
struct PixelStar: View {
    var color: Color = PixelTheme.gold

    private static let mask: [[Int]] = [
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
    ]

    var body: some View {
        Canvas { context, size in
            let rows = Self.mask.count
            let columns = Self.mask[0].count
            let cell = min(size.width / CGFloat(columns), size.height / CGFloat(rows))
            let originX = (size.width - cell * CGFloat(columns)) / 2
            let originY = (size.height - cell * CGFloat(rows)) / 2
            for (rowIndex, row) in Self.mask.enumerated() {
                for (columnIndex, value) in row.enumerated() where value == 1 {
                    let rect = CGRect(
                        x: originX + CGFloat(columnIndex) * cell,
                        y: originY + CGFloat(rowIndex) * cell,
                        width: cell,
                        height: cell
                    )
                    context.fill(Path(rect), with: .color(color))
                }
            }
        }
        .accessibilityHidden(true)
    }
}

#Preview {
    HStack {
        PixelStar().frame(width: 40, height: 40)
        PixelStar(color: PixelTheme.flame).frame(width: 24, height: 24)
    }
    .padding()
    .background(PixelTheme.canvas)
}
