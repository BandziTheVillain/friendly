const SITE_NAME = "Friendly";
const DEFAULT_DESCRIPTION = "Make friends, share posts and create unique experiences with the people you care about.";

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/$/, "");

type SeoOptions = {
    title?: string;
    description?: string;
    path?: string;
    noindex?: boolean;
};

// Builds the `head` option for a route. Social (og/twitter) tags live in index.html,
// since link-preview crawlers don't run JavaScript.
export function seo({ title, description = DEFAULT_DESCRIPTION, path, noindex }: SeoOptions = {}) {
    return {
        meta: [
            { title: title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Hang out with your people` },
            { name: "description", content: description },
            { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
        ],
        links: path !== undefined ? [{ rel: "canonical", href: `${SITE_URL}${path}` }] : [],
    };
}
