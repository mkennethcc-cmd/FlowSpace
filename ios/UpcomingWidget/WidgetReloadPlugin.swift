//  Freely · nudge the home-screen widget
//
//  A widget refreshes on its own schedule (every half hour here). This lets the app say "the list
//  changed, redraw now" the moment something is added, ticked off or rescheduled.
//
//  Add this file to the **App** target in Xcode (not the widget target) — docs/native.md, step 6.

import Foundation
import Capacitor
import WidgetKit

@objc(WidgetReloadPlugin)
public class WidgetReloadPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetReloadPlugin"
    public let jsName = "WidgetReload"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "reload", returnType: CAPPluginReturnPromise)
    ]

    @objc func reload(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }
}
