// tailwind-variants 0.1.x has no `exports` entry for ./dist/config, but
// @gluestack-ui/nativewind-utils imports TVConfig from that subpath as a
// type-only import. Declare it so tsc resolves it.
declare module "tailwind-variants/dist/config" {
  export type TVConfig = Record<string, any>
}
