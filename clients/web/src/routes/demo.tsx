import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demo')({
  component: Splash,
});

function Splash() {
  return (
    <div className="h-full w-full overflow-auto bg-(--color-background) p-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-6xl">Design System Demo</h1>
        <p className="text-lg">
          Container Query Width (cqw) based design system
        </p>
      </header>

      {/* Typography Scale */}
      <section className="mb-12">
        <h2 className="mb-4 text-3xl">Typography Scale</h2>
        <div className="flex flex-col gap-2">
          <div className="text-xs">text-xs: 0.75 × base</div>
          <div className="text-sm">text-sm: 0.875 × base</div>
          <div className="text-base">text-base: 1cqw (baseline)</div>
          <div className="text-lg">text-lg: 1.125 × base</div>
          <div className="text-xl">text-xl: 1.25 × base</div>
          <div className="text-2xl">text-2xl: 1.5 × base</div>
          <div className="text-3xl">text-3xl: 1.875 × base</div>
          <div className="text-4xl">text-4xl: 2.25 × base</div>
          <div className="text-5xl">text-5xl: 3 × base</div>
          <div className="text-6xl">text-6xl: 3.75 × base</div>
          <div className="text-7xl">text-7xl: 4.5 × base</div>
          <div className="text-8xl">text-8xl: 6 × base</div>
          <div className="text-9xl">text-9xl: 8 × base</div>
        </div>
      </section>

      {/* Spacing Scale */}
      <section className="mb-12">
        <h2 className="text-3xl">Spacing Scale</h2>
        <div className="flex flex-col gap-3">
          <div className="flex w-fit items-center bg-blue-400 p-1">
            <div>p-1 (0.26cqw / ~5px)</div>
          </div>
          <div className="flex w-fit items-center bg-blue-400 p-2">
            <div>p-2 (0.52cqw / ~10px)</div>
          </div>
          <div className="flex w-fit items-center bg-blue-400 p-4">
            <div>p-4 (1.04cqw / ~20px)</div>
          </div>
          <div className="flex w-fit items-center bg-blue-400 p-6">
            <div>p-6 (1.56cqw / ~30px)</div>
          </div>
          <div className="flex w-fit items-center bg-blue-400 p-8">
            <div>p-8 (2.08cqw / ~40px)</div>
          </div>
        </div>
      </section>

      {/* Color System */}
      <section className="mb-12">
        <h2 className="mb-4 text-3xl">Color System</h2>

        {/* Red */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Red</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-50" />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-100" />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-200" />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-300" />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-400" />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-500" />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-600" />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-700" />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-800" />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-red-900" />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Yellow */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Yellow</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-50" />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-100" />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-200" />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-300" />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-400" />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-500" />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-600" />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-700" />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-800" />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-yellow-900" />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Green */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Green</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-50" />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-100" />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-200" />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-300" />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-400" />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-500" />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-600" />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-700" />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-800" />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-green-900" />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Blue */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Blue</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-50" />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-100" />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-200" />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-300" />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-400" />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-500" />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-600" />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-700" />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-800" />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-blue-900" />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Purple */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Purple</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-50" />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-100" />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-200" />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-300" />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-400" />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-500" />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-600" />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-700" />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-800" />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-purple-900" />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Neutral Colors */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Neutral</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-50" />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-100" />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-200" />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-300" />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-400" />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-500" />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-600" />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-700" />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-800" />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div className="mb-1 aspect-square rounded-md bg-neutral-900" />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl">Text Colors</h3>
          <div className="space-y-2">
            <div className="text-text-blue text-lg">
              Primary Text (--color-text-primary)
            </div>
            <div className="text-lg text-text-secondary">
              Secondary Text (--color-text-secondary)
            </div>
            <div className="text-lg text-text-tertiary">
              Tertiary Text (--color-text-tertiary)
            </div>
          </div>
        </div>

        {/* Text on Various Backgrounds */}
        <div className="mb-6">
          <h3 className="mb-4 text-xl">Various text on Various Colors</h3>
          <p className="text-l">
            Colored backgrounds work best with white text
          </p>

          <div className="grid grid-cols-10 gap-2">
            {['primary'].map((priority) =>
              ['red', 'yellow', 'green', 'blue', 'purple'].map((color) =>
                [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                  (shade) => (
                    <div
                      key={`${color}-${shade}`}
                      className="rounded-lg p-4 text-center"
                      style={{
                        backgroundColor: `var(--color-${color}-${shade})`,
                        color: `var(--color-text-${priority})`,
                      }}
                    >
                      <div className="text-text-blue">Text</div>
                      <div className="text-xs text-text-secondary">
                        {color}-{shade}
                      </div>
                    </div>
                  )
                )
              )
            )}
          </div>

          <p className="text-l">Colored text should be on neutral background</p>
          <div className="grid grid-cols-10 gap-2">
            {['red', 'yellow', 'green', 'blue', 'purple'].map((textColor) =>
              [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                (textShade) =>
                  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                    (bgShade) => (
                      <div
                        key={`${textColor}-${textShade}-${bgShade}`}
                        className="rounded-lg p-4 text-center"
                        style={{
                          backgroundColor: `var(--color-neutral-${bgShade})`,
                          color: `var(--color-${textColor}-${textShade})`,
                        }}
                      >
                        <div className="text-text-blue">Text</div>
                        <div className="text-xs text-text-secondary">
                          {textColor}-{textShade}, neutral-{bgShade}
                        </div>
                      </div>
                    )
                  )
              )
            )}
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section className="mb-12">
        <h2 className="mb-4 text-3xl">Border Radius</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-none border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-none</div>
          </div>
          <div className="rounded-sm border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-sm</div>
          </div>
          <div className="rounded border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded</div>
          </div>
          <div className="rounded-md border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-md</div>
          </div>
          <div className="rounded-lg border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-lg</div>
          </div>
          <div className="rounded-xl border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-xl</div>
          </div>
          <div className="rounded-2xl border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-2xl</div>
          </div>
          <div className="rounded-3xl border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-3xl</div>
          </div>
          <div className="rounded-full border-2 border-blue-500 bg-blue-700 p-6">
            <div className="text-sm">rounded-full</div>
          </div>
        </div>
      </section>

      {/* Shadows, not supported lol */}
      {/* <section className="mb-12">
        <h2 className="mb-4 text-3xl">Shadows</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-lg border border-neutral-200 p-6 shadow-sm">
            <div className="text-base">shadow-sm</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-6 shadow">
            <div className="text-base">shadow</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-6 shadow-md">
            <div className="text-base">shadow-md</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-6 shadow-lg">
            <div className="text-base">shadow-lg</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-6 shadow-xl">
            <div className="text-base">shadow-xl</div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-6 shadow-2xl">
            <div className="text-base">shadow-2xl</div>
          </div>
        </div>
      </section> */}

      {/* Component Examples */}
      <section className="mb-12">
        <h2 className="mb-4 text-3xl">Component Examples</h2>

        {/* Buttons */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-lg bg-blue-600 px-6 py-3 text-base text-white transition-colors hover:bg-blue-400">
              blue Button
            </button>
            <button className="rounded-lg bg-neutral-200 px-6 py-3 text-base text-neutral-900 transition-colors hover:bg-neutral-50">
              Secondary Button
            </button>
            <button className="rounded-lg border-2 border-blue-600 px-6 py-3 text-base text-blue-500 transition-colors hover:bg-blue-800">
              Outline Button
            </button>
            <button className="rounded-lg bg-red-600 px-6 py-3 text-base text-white transition-colors hover:bg-red-400">
              Danger Button
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl">Cards</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-neutral-200 p-6 shadow-lg">
              <h4 className="mb-3 text-2xl">Card Component</h4>
              <p className="mb-4 text-base text-text-secondary">
                This is an example card using the design system tokens. All
                spacing, typography, and colors scale responsively with the
                container.
              </p>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-500">
                Action
              </button>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-900 p-6 shadow-md">
              <h4 className="mb-3 text-2xl text-blue-50">Colored Card</h4>
              <p className="mb-4 text-base text-blue-100">
                Cards can use different color schemes from the design system
                palette.
              </p>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl">Grid Layout</h3>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="transition-shadow-sm rounded-lg border border-neutral-200 p-6 text-center shadow-sm hover:shadow-lg"
              >
                <div
                  className="mb-2 text-4xl"
                  style={{ color: 'var(--color-blue-500)' }}
                >
                  {num}
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Grid Item
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
