import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Splash,
});

function Splash() {
  return (
    <div className="w-full h-full overflow-auto bg-(--color-background)">
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
        <h2 className="text-3xl">
          Typography Scale
        </h2>
        <div className="flex flex-col">
          <div className="text-xs">Extra Small (0.63cqw / ~12px)</div>
          <div className="text-sm">Small (0.73cqw / ~14px)</div>
          <div className="text-base">Base (0.83cqw / ~16px)</div>
          <div className="text-lg">Large (0.94cqw / ~18px)</div>
          <div className="text-xl">Extra Large (1.04cqw / ~20px)</div>
          <div className="text-2xl">2XL (1.25cqw / ~24px)</div>
          <div className="text-3xl">3XL (1.56cqw / ~30px)</div>
          <div className="text-4xl">4XL (1.88cqw / ~36px)</div>
          <div className="text-5xl">5XL (2.50cqw / ~48px)</div>
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
        <h2 className="text-3xl">
          Color System
        </h2>
        <div className="grid grid-cols-10">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div
              key={shade}
              className="aspect-square rounded-md"
              title={`primary-${shade}`}
            />
          ))}
        </div>
        <div className="flex">
          <div className="rounded-lg">
            Success
          </div>
          <div className="rounded-lg">
            Warning
          </div>
          <div className="rounded-lg">
            Error
          </div>
          <div className="rounded-lg">
            Info
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section className='mb-12'>
        <h2 className="text-3xl">
          Border Radius
        </h2>
        <div className="flex items-center">
          <div className="rounded-sm">
            Small
          </div>
          <div className="rounded">
            Base
          </div>
          <div className="rounded-md">
            Medium
          </div>
          <div className="rounded-lg">
            Large
          </div>
          <div className="rounded-xl">
            XL
          </div>
          <div className="rounded-2xl">
            2XL
          </div>
          <div className="rounded-full">
            Full
          </div>
        </div>
      </section>

      {/* Shadows */}
      <section className='mb-12'>
        <h2 className="text-3xl">
          Shadows
        </h2>
        <div className="grid grid-cols-3">
          <div className="rounded-lg shadow-sm">
            shadow-sm
          </div>
          <div className="rounded-lg shadow">
            shadow
          </div>
          <div className="rounded-lg shadow-md">
            shadow-md
          </div>
          <div className="rounded-lg shadow-lg">
            shadow-lg
          </div>
          <div className="rounded-lg shadow-xl">
            shadow-xl
          </div>
          <div className="rounded-lg shadow-2xl">
            shadow-2xl
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section className='mb-12'>
        <h2 className="text-3xl">
          Component Examples
        </h2>

        {/* Card */}
        <div className="p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl">
            Card Component
          </h3>
          <p className="text-base">
            This is an example card using the design system tokens. All spacing, typography, and colors scale responsively with the container.
          </p>
          <button
            className="p-3 rounded-lg text-base"
          >
            Primary Button
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className="p-6 rounded-lg shadow text-center"
            >
              <div className="text-4xl">
                {num}
              </div>
              <div className="text-sm">
                Grid Item
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
