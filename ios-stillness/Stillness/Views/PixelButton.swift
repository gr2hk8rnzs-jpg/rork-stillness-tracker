//
//  PixelButton.swift
//  Stillness
//

import SwiftUI

/// Primary arcade button: red plate, black pixel border and a hard offset
/// shadow that collapses on press like a physical console button.
/// Always rendered at full colour, per the design contract.
struct PixelButton: View {
    let title: String
    var tint: Color = PixelTheme.blood
    var textColor: Color = PixelTheme.canvas
    var fontSize: CGFloat = 20
    let action: () -> Void

    @State private var isPressed: Bool = false

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(PixelFont.display(fontSize))
                .tracking(1)
                .foregroundStyle(textColor)
                .frame(maxWidth: .infinity)
                .frame(height: 62)
                .background(tint)
                .pixelFrame()
                .offset(y: isPressed ? PixelTheme.dropOffset : 0)
                .background(alignment: .bottom) {
                    PixelRect()
                        .fill(PixelTheme.ink)
                        .frame(height: 62)
                        .offset(y: PixelTheme.dropOffset)
                }
        }
        .buttonStyle(.plain)
        .padding(.bottom, PixelTheme.dropOffset)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    guard !isPressed else { return }
                    isPressed = true
                }
                .onEnded { _ in isPressed = false }
        )
        .animation(.easeOut(duration: 0.06), value: isPressed)
    }
}

/// Small pixel chip used for secondary navigation in the toolbar.
struct PixelChipLabel: View {
    let title: String

    var body: some View {
        Text(title)
            .font(PixelFont.label(15))
            .tracking(1)
            .foregroundStyle(PixelTheme.ink)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(PixelTheme.surface)
            .pixelFrame(step: 4, lineWidth: 3)
    }
}

#Preview {
    VStack(spacing: 20) {
        PixelButton(title: "LOG SESSION") {}
        PixelButton(title: "BACK") {}
        PixelChipLabel(title: "QUEST LOG")
    }
    .padding()
    .background(PixelTheme.canvas)
}
