/**
 * Motion preference utilities for accessibility.
 * Respects user's prefers-reduced-motion system preference.
 */

/**
 * Check if user prefers reduced motion.
 * @returns true if user has enabled reduced motion in system settings
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate animation duration based on motion preference.
 * @param normalDuration - Duration in milliseconds when motion is allowed
 * @returns 0 if reduced motion is preferred, otherwise the normal duration
 */
export function getAnimationDuration(normalDuration: number): number {
	return prefersReducedMotion() ? 0 : normalDuration;
}

/**
 * Svelte action for animations that respect motion preference.
 * If user prefers reduced motion, no animation is applied.
 *
 * @example
 * <div use:animate={{ animation: 'fade-in', duration: 200 }}>
 *   Content
 * </div>
 */
export function animate(
	node: HTMLElement,
	{ animation, duration = 200 }: { animation: string; duration?: number }
): { destroy: () => void } | Record<string, never> {
	if (prefersReducedMotion()) {
		return {};
	}

	node.style.animation = `${animation} ${duration}ms`;

	return {
		destroy() {
			node.style.animation = '';
		}
	};
}

/**
 * Create a motion-safe transition config for svelte/transition.
 * Returns reduced or no transition when user prefers reduced motion.
 *
 * @example
 * import { fade } from 'svelte/transition';
 * import { motionSafeTransition } from '$lib/utils/motion';
 *
 * <div transition:fade={motionSafeTransition({ duration: 200 })}>
 */
export function motionSafeTransition<T extends { duration?: number }>(
	config: T
): T & { duration: number } {
	return {
		...config,
		duration: getAnimationDuration(config.duration ?? 200)
	};
}
