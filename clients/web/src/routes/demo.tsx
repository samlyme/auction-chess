import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demo')({
  component: Splash,
});

function Splash() {
  return (
    <div className="w-full h-full p-8 overflow-auto bg-(--color-background)">
      {/* Header */}
      <header className='mb-12'>
        <h1 className="text-6xl">
          Design System Demo
        </h1>
        <p className="text-lg">
          Container Query Width (cqw) based design system
        </p>
      </header>

      {/* Typography Scale */}
      <section className='mb-12'>
        <h2 className="text-3xl mb-4">
          Typography Scale
        </h2>
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
      <section className='mb-12'>
        <h2 className="text-3xl">
          Spacing Scale
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center p-1 bg-info w-fit">
            <div>
              p-1 (0.26cqw / ~5px)
            </div>
          </div>
          <div className="flex items-center p-2 bg-info w-fit">
            <div>
              p-2 (0.52cqw / ~10px)
            </div>
          </div>
          <div className="flex items-center p-4 bg-info w-fit">
            <div>
              p-4 (1.04cqw / ~20px)
            </div>
          </div>
          <div className="flex items-center p-6 bg-info w-fit">
            <div>
              p-6 (1.56cqw / ~30px)
            </div>
          </div>
          <div className="flex items-center p-8 bg-info w-fit">
            <div>
              p-8 (2.08cqw / ~40px)
            </div>
          </div>
        </div>
      </section>

      {/* Color System */}
      <section className='mb-12'>
        <h2 className="text-3xl mb-4">
          Color System
        </h2>

        {/* Primary Colors */}
        <div className="mb-6">
          <h3 className="text-xl mb-2">Primary Colors</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-50)' }}
                title="primary-50"
              />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-100)' }}
                title="primary-100"
              />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-200)' }}
                title="primary-200"
              />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-300)' }}
                title="primary-300"
              />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-400)' }}
                title="primary-400"
              />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-500)' }}
                title="primary-500"
              />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-600)' }}
                title="primary-600"
              />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-700)' }}
                title="primary-700"
              />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-800)' }}
                title="primary-800"
              />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-primary-900)' }}
                title="primary-900"
              />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Neutral Colors */}
        <div className="mb-6">
          <h3 className="text-xl mb-2">Neutral Colors</h3>
          <div className="grid grid-cols-10 gap-2">
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-50)' }}
                title="neutral-50"
              />
              <div className="text-xs">50</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-100)' }}
                title="neutral-100"
              />
              <div className="text-xs">100</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-200)' }}
                title="neutral-200"
              />
              <div className="text-xs">200</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-300)' }}
                title="neutral-300"
              />
              <div className="text-xs">300</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-400)' }}
                title="neutral-400"
              />
              <div className="text-xs">400</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-500)' }}
                title="neutral-500"
              />
              <div className="text-xs">500</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-600)' }}
                title="neutral-600"
              />
              <div className="text-xs">600</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-700)' }}
                title="neutral-700"
              />
              <div className="text-xs">700</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-800)' }}
                title="neutral-800"
              />
              <div className="text-xs">800</div>
            </div>
            <div className="text-center">
              <div
                className="aspect-square rounded-md mb-1"
                style={{ backgroundColor: 'var(--color-neutral-900)' }}
                title="neutral-900"
              />
              <div className="text-xs">900</div>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="mb-6">
          <h3 className="text-xl mb-2">Semantic Colors</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: 'var(--color-success)' }}
              />
              <div className="text-sm">Success</div>
            </div>
            <div className="text-center">
              <div
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: 'var(--color-warning)' }}
              />
              <div className="text-sm">Warning</div>
            </div>
            <div className="text-center">
              <div
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: 'var(--color-error)' }}
              />
              <div className="text-sm">Error</div>
            </div>
            <div className="text-center">
              <div
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: 'var(--color-info)' }}
              />
              <div className="text-sm">Info</div>
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="mb-6">
          <h3 className="text-xl mb-2">Text Colors</h3>
          <div className="space-y-2">
            <div style={{ color: 'var(--color-text-primary)' }} className="text-lg">
              Primary Text (--color-text-primary)
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }} className="text-lg">
              Secondary Text (--color-text-secondary)
            </div>
            <div style={{ color: 'var(--color-text-tertiary)' }} className="text-lg">
              Tertiary Text (--color-text-tertiary)
            </div>
            <div
              style={{
                color: 'var(--color-text-inverse)',
                backgroundColor: 'var(--color-neutral-900)'
              }}
              className="text-lg p-2 inline-block rounded"
            >
              Inverse Text (--color-text-inverse)
            </div>
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section className='mb-12'>
        <h2 className="text-3xl mb-4">
          Border Radius
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-6 bg-primary-200 rounded-none border-2 border-primary-500">
            <div className="text-sm">rounded-none</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-sm border-2 border-primary-500">
            <div className="text-sm">rounded-sm</div>
          </div>
          <div className="p-6 bg-primary-200 rounded border-2 border-primary-500">
            <div className="text-sm">rounded</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-md border-2 border-primary-500">
            <div className="text-sm">rounded-md</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-lg border-2 border-primary-500">
            <div className="text-sm">rounded-lg</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-xl border-2 border-primary-500">
            <div className="text-sm">rounded-xl</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-2xl border-2 border-primary-500">
            <div className="text-sm">rounded-2xl</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-3xl border-2 border-primary-500">
            <div className="text-sm">rounded-3xl</div>
          </div>
          <div className="p-6 bg-primary-200 rounded-full border-2 border-primary-500">
            <div className="text-sm">rounded-full</div>
          </div>
        </div>
      </section>

      {/* Shadows */}
      <section className='mb-12'>
        <h2 className="text-3xl mb-4">
          Shadows
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="text-base">shadow-sm</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow border border-neutral-200">
            <div className="text-base">shadow</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md border border-neutral-200">
            <div className="text-base">shadow-md</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg border border-neutral-200">
            <div className="text-base">shadow-lg</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-xl border border-neutral-200">
            <div className="text-base">shadow-xl</div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-2xl border border-neutral-200">
            <div className="text-base">shadow-2xl</div>
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section className='mb-12'>
        <h2 className="text-3xl mb-4">
          Component Examples
        </h2>

        {/* Buttons */}
        <div className="mb-8">
          <h3 className="text-xl mb-4">Buttons</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              className="px-6 py-3 rounded-lg text-base bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Primary Button
            </button>
            <button
              className="px-6 py-3 rounded-lg text-base bg-neutral-200 text-neutral-900 hover:bg-neutral-300 transition-colors"
            >
              Secondary Button
            </button>
            <button
              className="px-6 py-3 rounded-lg text-base border-2 border-primary-500 text-primary-500 hover:bg-primary-50 transition-colors"
            >
              Outline Button
            </button>
            <button
              className="px-6 py-3 rounded-lg text-base bg-error text-white hover:bg-red-600 transition-colors"
            >
              Danger Button
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8">
          <h3 className="text-xl mb-4">Cards</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-xl shadow-lg bg-white border border-neutral-200">
              <h4 className="text-2xl mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Card Component
              </h4>
              <p className="text-base mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                This is an example card using the design system tokens. All spacing, typography, and colors scale responsively with the container.
              </p>
              <button
                className="px-4 py-2 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Action
              </button>
            </div>
            <div className="p-6 rounded-xl shadow-md bg-primary-50 border border-primary-200">
              <h4 className="text-2xl mb-3" style={{ color: 'var(--color-primary-700)' }}>
                Colored Card
              </h4>
              <p className="text-base mb-4" style={{ color: 'var(--color-primary-900)' }}>
                Cards can use different color schemes from the design system palette.
              </p>
              <button
                className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="mb-8">
          <h3 className="text-xl mb-4">Grid Layout</h3>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="p-6 rounded-lg shadow bg-white border border-neutral-200 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-2" style={{ color: 'var(--color-primary-500)' }}>
                  {num}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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
