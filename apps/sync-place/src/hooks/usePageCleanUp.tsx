import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const usePageCleanUp = (cleanupFn: () => void) => {
	const router = useRouter();

	useEffect(() => {
		// A. Handle full page reload or window close
		const handleBrowserUnload = () => {
			cleanupFn();
		};
		window.addEventListener("beforeunload", handleBrowserUnload);

		// B. Handle internal SPA route change transitions
		// Subscribe to router history transitions
		const unsubscribe = router.history.subscribe(() => {
			// Fires whenever a route successfully transitions internally
			cleanupFn();
		});

		// Component unmount cleanup
		return () => {
			window.removeEventListener("beforeunload", handleBrowserUnload);
			unsubscribe();
		};
	}, [router, cleanupFn]);
};
