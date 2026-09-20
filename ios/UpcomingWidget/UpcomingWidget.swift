//  Freely · home-screen widget
//
//  Shows the next few things with a date. It reads a small list the app writes into the shared App
//  Group container (see src/native.js → saveWidgetSnapshot); a widget can't run the app's own code,
//  so the dates arrive already worded ("Tomorrow", "2d overdue").
//
//  Adding it to the project is done once, in Xcode, on a Mac — docs/native.md has the click-by-click.

import WidgetKit
import SwiftUI

// Must match capacitor.config.json → plugins.Preferences.group, and the App Group on BOTH targets.
private let appGroup = "group.com.freely.app"
// Capacitor's Preferences plugin stores every key with this prefix.
private let storeKey = "CapacitorStorage.fs_widget_upcoming"

struct Item: Codable, Identifiable {
    let id: String
    let title: String
    let when: String       // "Today" · "Tomorrow" · "Sep 30" · "2d overdue" · "Date TBD"
    let time: String       // "3:00 PM", or empty
    let late: Bool
}

private func readItems() -> [Item] {
    guard let defaults = UserDefaults(suiteName: appGroup),
          let raw = defaults.string(forKey: storeKey) ?? defaults.string(forKey: "fs_widget_upcoming"),
          let data = raw.data(using: .utf8),
          let items = try? JSONDecoder().decode([Item].self, from: data)
    else { return [] }
    return items
}

struct Entry: TimelineEntry {
    let date: Date
    let items: [Item]
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry {
        Entry(date: Date(), items: [Item(id: "1", title: "Call the dentist", when: "Tomorrow", time: "3:00 PM", late: false)])
    }
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
        completion(Entry(date: Date(), items: readItems()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        // Re-read every half hour; the app also nudges the widget whenever the list changes.
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
        completion(Timeline(entries: [Entry(date: Date(), items: readItems())], policy: .after(next)))
    }
}

struct UpcomingWidgetView: View {
    var entry: Entry
    @Environment(\.widgetFamily) var family
    private var limit: Int { family == .systemLarge ? 6 : (family == .systemMedium ? 3 : 2) }

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(spacing: 5) {
                Text("⚡️").font(.system(size: 12))
                Text("Upcoming").font(.system(size: 12, weight: .bold)).foregroundColor(.secondary)
                Spacer()
            }
            if entry.items.isEmpty {
                Spacer()
                Text("Nothing with a date yet").font(.system(size: 13)).foregroundColor(.secondary)
                Spacer()
            } else {
                ForEach(entry.items.prefix(limit)) { item in
                    VStack(alignment: .leading, spacing: 1) {
                        Text(item.title).font(.system(size: 13, weight: .medium)).lineLimit(1)
                        HStack(spacing: 4) {
                            Text(item.when).font(.system(size: 11))
                                .foregroundColor(item.late ? .red : .secondary)
                            if !item.time.isEmpty {
                                Text("· \(item.time)").font(.system(size: 11)).foregroundColor(.secondary)
                            }
                        }
                    }
                }
                Spacer(minLength: 0)
            }
        }
        .padding(12)
        .widgetURL(URL(string: "freely://upcoming"))     // tapping it opens Freely on Upcoming
    }
}

@main
struct UpcomingWidget: Widget {
    let kind = "UpcomingWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                UpcomingWidgetView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
            } else {
                UpcomingWidgetView(entry: entry).padding(0).background(Color(.systemBackground))
            }
        }
        .configurationDisplayName("Upcoming")
        .description("Your next few dated tasks.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
