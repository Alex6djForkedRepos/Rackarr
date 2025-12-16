import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HelpPanel from '$lib/components/HelpPanel.svelte';
import { VERSION } from '$lib/version';

describe('HelpPanel', () => {
	describe('Visibility', () => {
		it('renders when open=true', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('hidden when open=false', () => {
			render(HelpPanel, { props: { open: false } });

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('App Information', () => {
		it('shows app name', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText('Rackarr')).toBeInTheDocument();
		});

		it('shows version number', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText(new RegExp(VERSION))).toBeInTheDocument();
		});
	});

	describe('Keyboard Shortcuts', () => {
		it('shows shortcut categories', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText('General')).toBeInTheDocument();
			expect(screen.getByText('Editing')).toBeInTheDocument();
			expect(screen.getByText('File')).toBeInTheDocument();
		});

		it('lists common shortcuts', () => {
			render(HelpPanel, { props: { open: true } });

			// Check for some key shortcuts
			expect(screen.getByText('Escape')).toBeInTheDocument();
			expect(screen.getByText('Delete')).toBeInTheDocument();
		});

		it('shows Ctrl/Cmd shortcuts', () => {
			render(HelpPanel, { props: { open: true } });

			// Should show save shortcut (Ctrl/Cmd + S)
			expect(screen.getByText('Ctrl/Cmd + S')).toBeInTheDocument();
		});
	});

	describe('Links', () => {
		it('shows GitHub link icon', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
		});

		it('GitHub link points to correct repository', () => {
			render(HelpPanel, { props: { open: true } });

			const githubLink = screen.getByRole('link', { name: /github/i });
			expect(githubLink.getAttribute('href')).toBe('https://github.com/rackarr/rackarr');
		});

		it('GitHub link opens in new tab', () => {
			render(HelpPanel, { props: { open: true } });

			const githubLink = screen.getByRole('link', { name: /github/i });
			expect(githubLink.getAttribute('target')).toBe('_blank');
		});

		it('GitHub link has rel="noopener noreferrer" for security', () => {
			render(HelpPanel, { props: { open: true } });

			const githubLink = screen.getByRole('link', { name: /github/i });
			expect(githubLink.getAttribute('rel')).toContain('noopener');
		});
	});

	describe('Close Actions', () => {
		it('escape key dispatches close event', async () => {
			const onClose = vi.fn();

			render(HelpPanel, {
				props: { open: true, onclose: onClose }
			});

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});
});
