import { getIconData, iconToSVG } from "@iconify/utils";
export function resolveIconSvg(iconSet, name, options = {}) {
  const iconData = getIconData(iconSet, name);
  if (!iconData) {
    throw new Error(`[nuxt-native] Icon "${name}" was not found in the given icon set.`);
  }
  const { attributes, body } = iconToSVG(iconData, { width: options.width, height: options.height });
  const resolvedBody = options.color ? body.replace(/currentColor/g, options.color) : body;
  const attrString = Object.entries(attributes).filter(([, value]) => value !== void 0).map(([key, value]) => `${key}="${value}"`).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" ${attrString}>${resolvedBody}</svg>`;
}
