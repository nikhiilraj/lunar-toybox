# Lunar interface design system

The moon is the experience; the interface helps visitors understand and explore it. This pass changes the navigation, portfolio cards, map, games, settings and every content dialog. It preserves the 3D art direction and mechanics.

## Reference study

Reviewed on 8 October 2026. References guide composition and interaction, not copied branding or page designs.

| Reference | Observed principle | Applied here |
| --- | --- | --- |
| [Apple](https://www.apple.com/) · [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | Clear size hierarchy, generous space, concise controls | Strong panel titles, a compact floating nav, clear primary/secondary actions |
| [Clay](https://clay.global/) | Editorial scale, whitespace, visual work taking priority | Project screenshot before description, confident headings, less ornament |
| [Adaptify](https://adaptify.ai/) | White cards, pale neutral surfaces, focused violet accents | Light panels, subtle lavender selection states, neutral text |
| [Linear’s UI redesign](https://linear.app/now/how-we-redesigned-the-linear-ui) | Reduce noise; make hierarchy, alignment and density consistent | Shared panel anatomy, aligned labels, restrained borders and repeated controls |
| [Vercel Geist materials](https://vercel.com/geist/materials) · [colors](https://vercel.com/geist/colors) | Distinct surface roles and predictable contrast | Canvas, panel, inset surface and card roles; borders before heavy shadows |
| [Stripe](https://stripe.com/) | Large readable hierarchy, modular content, selective accent | Image-led project card, illustrated game cards, segmented map directory |

Only these six brands informed the visual direction. The lunar world remains Nikhil’s original content; no logos, product screenshots, proprietary artwork or paid templates were imported from the references.

## Free component study and decisions

The libraries are alternatives, not seven competing foundations. Combining all their CSS systems would make the result less consistent. The working foundation stays shadcn/ui with Radix primitives, using locally editable source.

| Library and reviewed documentation | Useful free patterns | Decision |
| --- | --- | --- |
| [shadcn/ui](https://ui.shadcn.com/docs/components), [Card](https://ui.shadcn.com/docs/components/radix/card), [Dialog](https://ui.shadcn.com/docs/components/radix/dialog) | Card header/content/footer, modal focus handling, Button, Slider, Tooltip, Badge | Used throughout. Semantic `data-slot` attributes connect the shared primitives to the theme. Radix retains keyboard navigation, focus trapping and escape dismissal. |
| [Magic UI](https://magicui.design/docs/components), [Bento Grid](https://magicui.design/docs/components/bento-grid) | Image-led cards, clear card content/action anatomy, restrained reveals | Existing free BlurFade is used with a short fade and zero blur. Profile and game layouts apply the modular card composition; they are not represented as an installed Bento component. |
| [Aceternity UI](https://ui.aceternity.com/components), [Resizable Navbar](https://ui.aceternity.com/components/resizable-navbar) | Compact navigation surface, separation of brand/links/actions | Navigation composition informed the unified floating header. Implemented with existing shadcn Buttons, rather than adding a scroll-resizing behavior to a fixed game canvas. The existing TextGenerateEffect remains available. |
| [Motion](https://motion.dev/docs/react), [layout animations](https://motion.dev/docs/react-layout-animations) | State transitions, brief entrances, reduced-motion support | Existing Motion drives reveals and world notifications. `MotionConfig` respects device preferences; orbit experiments begin paused under reduced motion. |
| [HyperUI cards](https://www.hyperui.dev/components/marketing/cards/) | Copyable image/content/action layouts, straightforward responsive grids | Considered as composition guidance. Existing shadcn cards cover these needs without a second primitive system. |
| [Flowbite navbar](https://flowbite.com/docs/components/navbar/) | Responsive navigation, clear actions, mobile layouts | Reviewed its free navbar anatomy. Kept a two-row mobile header so all six stops remain directly reachable; no Flowbite runtime added. |
| [daisyUI components](https://daisyui.com/components/) | Semantic component classes, consistent themes and state styling | Reviewed its theme consistency and component taxonomy. Kept one theme token system instead of adding a parallel theme engine. |

Free documented patterns and already installed open-source components only. No premium/Pro templates, private registries or paid assets were used. Upstream component provenance remains in [THIRD_PARTY.md](../THIRD_PARTY.md).

## CARP in the implementation

CARP refers to contrast, alignment, repetition and proximity, the four principles described in Robin Williams’s [The Non-Designer’s Design Book](https://www.pearson.com/en-us/subject-catalog/p/Non-Designer-s-Design-Book-The-4th-Edition/P200000000691?view=educator).

- **Contrast:** The game stays dark; content opens in an off-white panel with dark text. A 28–36px panel heading leads 13–14px descriptive text. Primary actions use a dark fill, secondary actions an outline, and tertiary actions plain text. Violet marks selection, focus and experiments.
- **Alignment:** Titles, descriptions and cards share a left edge. Card headers, content and footers use consistent padding. Map choices align their index, two-line label and status icon. Setting names align with their control and level readout.
- **Repetition:** One family, one button system, one panel shell, and shared card, line, text and accent tokens. The same close control, return action and focus treatment recur in every panel.
- **Proximity:** Each title stays close to its description, each slider to its label, and each action to its object. Larger gaps separate content groups. Settings separate movement instructions, audio preferences and device-only stamps.

## Tokens and behavior

- **Typeface:** self-hosted Manrope, Inter fallback. Inherited by buttons, inputs, selects, textareas, SVG labels, keyboard hints and outputs. The moon’s dimensional lettering and postcard export also use Manrope. The user-supplied PDF and preview remain unchanged original documents.
- **Surfaces:** panel `#fcfcfd`; card `#ffffff`; inset `#f5f5f7`; line `#e5e5ea`.
- **Text:** primary `#202127`; supporting `#666671`; violet focus/accent `#6b58d5`.
- **Spacing:** 8/12/16/20/24/32px. More space separates groups than separates related elements.
- **Shape:** 9px controls; 14–16px cards; 18–22px dialogs. Pills are reserved for compact status badges.
- **Motion:** short transitions around 180–240ms. No persistent glows or decorative card motion. Reduced-motion preferences are respected.
- **Small screens:** header becomes two rows; panels stay within the viewport and scroll internally; maps, games and settings stack. World touch controls stay 44px.
- **Content integrity:** one real project, one supplied résumé, verified GitHub, and explicit empty biography/experience/notes. No invented projects or employment claims.

## Editing and verification

`src/lunar.css` owns the design tokens and component styles. `src/portfolio-panels.tsx` owns work, profile, résumé, contact and lab compositions. `src/destination-ui.tsx` owns map and orbit UI; `src/arcade.tsx` owns game interfaces. The root app retains world and audio coordination.

The project cover is an actual browser capture of this portfolio’s 3D scene, stored at `public/images/lunar-world.png`; it contains no third-party product imagery. Visual review should cover desktop and mobile, every dialog, both games, map travel/routes, keyboard dismissal and focus return, loaded Manrope, and simple mode. Keep the behavior tests and production build passing before release.
