# DocReview Studio

A standalone, 100% client-side HTML & Markdown document review, AI prompt generation, and visual diff inspection studio designed for technical writers, engineering teams, and AI-assisted workflows.

> 🇯🇵 **[Japanese README is available here (README.md)](README.md)**  
> 📖 **User Manual**: [HTML Version (manual.en.html)](manual.en.html) / [Markdown Version (manual.en.md)](manual.en.md) | [日本語版 (manual.html)](manual.html)

DocReview Studio runs entirely inside your modern Chromium-based web browser on both **Windows** and **macOS**. It loads local HTML manuals and Markdown documents (`.md` / `.markdown`), enables intuitive human-in-the-loop review feedback, automatically aggregates structured prompts for LLMs (Claude, Gemini, ChatGPT), provides instant inline diff highlighting, and supports WinMerge-style synchronized side-by-side visual diff verification—with **zero external server transmission**.

---

## 🌟 Key Features

- **100% Client-Side & Privacy-First (Offline Ready)**
  - Zero network transmission. Operates purely within your local browser memory using the native **File System Access API**.
  - Review confidential company documents, proprietary source code, and unreleased documentation in total privacy.
- **Fast HTML & Markdown (.md) Rendering**
  - Instant preview for both HTML documents and Markdown files (`.md` / `.markdown`) rendered with clean, GitHub-flavored styling.
  - Bundles an offline parser (`marked.min.js`) that works without any network connection.
- **Hierarchical File Tree & Instant Filtering**
  - File tree view with visual badges (`HTML` / `MD`) and folder toggling.
  - Incremental real-time search box to quickly filter down thousands of documentation files.
- **Intuitive Review & Evidence Management**
  - **Drag-to-select text**: Highlight any sentence or paragraph to generate a feedback card in one click.
  - **Image & figure reviews**: Click or right-click images to auto-capture image paths, figure captions, and section headers.
  - **Document-wide feedback**: Log overarching document-level feedback with a single click.
  - Category tagging (`Fix` / `Add` / `Delete` / `Question` / `Pending`), detailed instruction fields, and automatic scroll-to-text with animated pulse highlighting.
  - Export and restore review evidence in **JSON** or pasteable **Markdown tables**.
- **Automated AI Revision Prompts**
  - Aggregates logged feedback into structured, high-accuracy prompts (file path, line estimate, selected text, surrounding context, instructions) tailored for Claude, Gemini, ChatGPT, or local LLMs to execute in-place edits cleanly.
  - Single-click clipboard copy for active document or all documents across the workspace.
- **High-Precision Visual Diff Inspector**
  - **Inline Diff Highlighting**: Instantly paints updated and inserted text green directly inside the reading preview (`⏭️ Modified (Diff)`). Toggle back and forth between original and modified states effortlessly.
  - **WinMerge-Style Side-by-Side Comparison**: Synchronized two-pane comparison mode with dynamic canvas bridge lines and scroll locking between baseline and active files.
  - **Google `diff-match-patch` + HTML Tokenizer**: Lexical token parser separates HTML markup from text, preventing broken layouts and eliminating false-positive color noise on untouched headings.
- **Generations & Snapshot Versioning**
  - Automatic safeguarding of the original file baseline (`v0`).
  - Capture milestones anytime with **"📸 Save"** (`v1`, `v2`, ...).
  - Freely switch the diff comparison baseline and safely export snapshots via **"📥 Export As"**.
- **IDE-Grade Usability & Productivity**
  - **Split-pane resizing**: Freely adjust pane widths by dragging dividers.
  - **Independent 3-zone zoom**: Independently zoom the File Tree, Preview, or Evidence List using `Ctrl/Cmd + Wheel` or dedicated toolbar buttons.
  - **Sidebar toggles**: Quickly expand reading space with `Alt + 1` / `Option + 1` (File Tree) and `Alt + 2` / `Option + 2` (Evidence List).
  - **Detached multi-window display**: Pop out original and modified views into separate windows for dual-monitor setups.

---

## ⌨️ Keyboard Shortcuts (Windows & macOS)

| Action | Windows | macOS (Mac) |
| :--- | :--- | :--- |
| **Toggle Left Pane (File Tree)** | `Alt + 1` | `Option + 1` (`⌥1`) |
| **Toggle Right Pane (Evidence List)** | `Alt + 2` | `Option + 2` (`⌥2`) |
| **Independent Pane Zoom Under Cursor** | `Ctrl + Scroll Wheel`<br><small>or `Alt + Scroll Wheel`</small> | `Cmd + Scroll` (`⌘`)<br><small>or `Option + Scroll` (`⌥`)</small> |
| **Reset Pane Zoom to 100%** | `Ctrl + 0`<br><small>or Middle-Click / `Alt + 0`</small> | `Cmd + 0` (`⌘0`)<br><small>or Middle-Click / `Option + 0`</small> |

---

## 🚀 Quick Start

- 🌐 **Live Web App**: [https://tossy-apps.github.io/doc-review-studio/](https://tossy-apps.github.io/doc-review-studio/)
- 📖 **User Manual (HTML)**: [manual.en.html](manual.en.html) (or [manual.en.md](manual.en.md))

### Basic Workflow

1. Open `index.html` (or the live URL) in any Chromium-based browser (**Google Chrome**, **Microsoft Edge**, **Brave**).
2. Click **"📁 Open Source"** in the top header and grant access to the folder containing your documentation.
3. Select a file from the left tree. Highlight text in the preview and click **"📌 Add to Feedback"** (or right-click an image) to create a feedback card.
4. Input your revision instructions, then click **"🤖 Selected File Prompt"** or **"🤖 All Files Prompt"** to copy the formatted LLM instructions.
5. After your AI makes edits on disk, click **"🔄 Reload File"** or **"🔄 Reload Workspace"**, then verify the revisions using **"⏭️ Modified (Diff)"** or **"🔄 WinMerge Diff"**.

> **System Requirements**: Any modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave, etc.) on **Windows** or **macOS**.  
> *Note*: Safari and Firefox do not currently support the native File System Access API.

---

## 📁 Repository Structure

```text
.
├── images/                 # Screenshot assets for user manuals
├── index.html              # DocReview Studio application (Self-contained SPA)
├── diff-match-patch.js     # Google diff-match-patch (LCS diff engine, offline)
├── marked.min.js           # Markdown parsing library (Offline)
├── onboarding-guide.js     # Interactive studio walkthrough module
├── onboarding-guide.css    # Styles for onboarding walkthrough
├── manual.html             # Detailed user manual (Japanese HTML)
├── manual.en.html          # Detailed user manual (English HTML)
├── manual.md               # Detailed user manual draft (Japanese Markdown)
├── manual.en.md            # Detailed user manual draft (English Markdown)
├── robots.txt              # Search engine directives
├── README.md               # Japanese project documentation
├── README.en.md            # English project documentation
└── LICENSE                 # Open-source license (MIT & 3rd-party licenses)
```

---

## 📜 License

This software is released under the **MIT License**.  
See [LICENSE](LICENSE) for details.

### Third-Party Licenses
- **diff-match-patch**: [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0) (Copyright 2018 The diff-match-patch Authors)
- **marked.js**: [MIT License](https://github.com/markedjs/marked/blob/master/LICENSE.md) (Copyright (c) 2018+, MarkedJS)
