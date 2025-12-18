<!--
  About Panel Component
  Shows app information, keyboard shortcuts, and links
-->
<script lang="ts">
	import { VERSION } from '$lib/version';
	import Dialog from './Dialog.svelte';
	import LogoLockup from './LogoLockup.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';

	interface Props {
		open: boolean;
		onclose?: () => void;
	}

	let { open, onclose }: Props = $props();

	const toastStore = getToastStore();

	// Get browser user agent for troubleshooting
	const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

	// Toggle for showing debug info
	let showDebugInfo = $state(false);

	async function copyDebugInfo() {
		const text = `Rackarr v${VERSION} on ${userAgent}`;
		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(text);
			} else {
				const textArea = document.createElement('textarea');
				textArea.value = text;
				textArea.style.position = 'fixed';
				textArea.style.left = '-9999px';
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
			}
			toastStore.showToast('Debug info copied', 'success', 2000);
		} catch {
			toastStore.showToast('Failed to copy', 'error');
		}
	}

	function toggleDebugInfo() {
		showDebugInfo = !showDebugInfo;
	}

	// Keyboard shortcuts grouped by category
	const shortcutGroups = [
		{
			name: 'General',
			shortcuts: [
				{ key: 'Escape', action: 'Clear selection / Close dialog' },
				{ key: 'I', action: 'Toggle display mode' },
				{ key: 'F', action: 'Fit all (zoom to fit)' }
			]
		},
		{
			name: 'Editing',
			shortcuts: [
				{ key: 'Delete', action: 'Delete selected' },
				{ key: '↑ / ↓', action: 'Move device up/down 1U' }
			]
		},
		{
			name: 'File',
			shortcuts: [
				{ key: 'Ctrl/Cmd + S', action: 'Save layout' },
				{ key: 'Ctrl/Cmd + O', action: 'Load layout' },
				{ key: 'Ctrl/Cmd + E', action: 'Export image' },
				{ key: 'Ctrl/Cmd + Z', action: 'Undo' },
				{ key: 'Ctrl/Cmd + Shift + Z', action: 'Redo' }
			]
		}
	];

	const GITHUB_URL = 'https://github.com/rackarr/rackarr';

	function handleClose() {
		onclose?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	$effect(() => {
		if (open) {
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<Dialog {open} title="About" width="600px" onclose={handleClose}>
	<div class="about-content">
		<!-- Header: Logo + Version + GitHub -->
		<header class="about-header">
			<div class="brand-row">
				<LogoLockup size={48} />
				<button
					type="button"
					class="version-btn"
					onclick={toggleDebugInfo}
					title="Click to show debug info"
				>
					v{VERSION}
					<svg
						class="chevron-icon"
						class:expanded={showDebugInfo}
						viewBox="0 0 16 16"
						width="12"
						height="12"
						aria-hidden="true"
					>
						<path
							fill="currentColor"
							d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"
						/>
					</svg>
				</button>
			</div>
			<a
				href={GITHUB_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="github-link"
				title="View on GitHub"
			>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-label="GitHub">
					<path
						fill="currentColor"
						d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
					/>
				</svg>
			</a>
		</header>

		<!-- Debug info (expandable) -->
		{#if showDebugInfo}
			<div class="debug-info">
				<code class="user-agent">{userAgent}</code>
				<button type="button" class="copy-btn" onclick={copyDebugInfo} title="Copy debug info">
					<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
						<path
							fill="currentColor"
							d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"
						/>
						<path
							fill="currentColor"
							d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"
						/>
					</svg>
				</button>
			</div>
		{/if}

		<!-- Keyboard Shortcuts (grouped) -->
		{#each shortcutGroups as group (group.name)}
			<section class="shortcut-group">
				<h4>{group.name}</h4>
				<div class="shortcuts-list">
					{#each group.shortcuts as { key, action } (key)}
						<div class="shortcut-row">
							<kbd class="key-cell">{key}</kbd>
							<span class="action">{action}</span>
						</div>
					{/each}
				</div>
			</section>
		{/each}

		<p class="made-in">Made in Canada 🇨🇦 with ❤️</p>
	</div>
</Dialog>

<style>
	.about-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* Header row: Logo + Version + GitHub */
	.about-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--colour-border);
	}

	.brand-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.version-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-family: var(--font-mono, monospace);
		color: var(--colour-text-muted);
		transition: all 0.15s ease;
	}

	.version-btn:hover {
		background: var(--colour-surface);
		border-color: var(--colour-border);
		color: var(--colour-text);
	}

	.chevron-icon {
		transition: transform 0.15s ease;
	}

	.chevron-icon.expanded {
		transform: rotate(180deg);
	}

	.github-link {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--colour-text-muted);
		transition:
			color 0.15s ease,
			transform 0.15s ease;
	}

	.github-link:hover {
		color: var(--colour-text);
		transform: scale(1.1);
	}

	/* Debug info panel */
	.debug-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--colour-surface);
		border-radius: var(--radius-sm);
		border: 1px solid var(--colour-border);
	}

	.debug-info .user-agent {
		flex: 1;
		font-size: var(--font-size-xs);
		color: var(--colour-text-muted);
		font-family: var(--font-mono, monospace);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--colour-text-muted);
		transition:
			color 0.15s ease,
			background 0.15s ease;
	}

	.copy-btn:hover {
		color: var(--colour-selection);
		background: var(--colour-surface-hover);
	}

	/* Shortcut groups */
	.shortcut-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.shortcut-group h4 {
		margin: 0;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--colour-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.shortcuts-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--font-size-sm);
	}

	.key-cell {
		min-width: 140px;
		font-family: var(--font-mono, monospace);
		font-size: var(--font-size-xs);
		background: var(--colour-surface);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-sm);
		padding: 2px var(--space-2);
		color: var(--colour-text);
	}

	.action {
		color: var(--colour-text-muted);
	}

	.made-in {
		margin: 0;
		padding-top: var(--space-3);
		font-size: var(--font-size-sm);
		color: var(--colour-text-muted);
		text-align: center;
		border-top: 1px solid var(--colour-border);
	}
</style>
