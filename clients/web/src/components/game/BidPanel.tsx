export default function BidPanel() {
  return (
    <div className="h-full w-full rounded-2xl bg-neutral-900 p-4">
      <div className="grid h-full w-full grid-rows-12 gap-4">
        <div className="row-span-3 h-full w-full rounded-lg bg-neutral-800 p-4">
          <div className="grid h-full w-full grid-rows-3 gap-4">
            <div className="h-full w-full rounded bg-neutral-700">
              <p className="mt-3 text-center text-xl">username</p>
            </div>
            <div className="row-span-2 h-full w-full rounded bg-neutral-700">
              <p className="mt-3 text-center text-7xl">$100</p>
            </div>
          </div>
        </div>

        <div className="row-span-6 h-full w-full rounded-lg bg-neutral-800 p-4">
          <div className="grid h-full w-full grid-rows-3 gap-4">
            <div className="row-span-1 h-full w-full rounded-md bg-neutral-700 p-4">
              <div className="grid h-full w-full grid-cols-2 gap-2">
                <div className="h-full w-full rounded-sm bg-red-500 p-2">
                  <h3 className="text-center text-sm">Opponent Bid</h3>
                  <h2 className="text-center text-4xl">$50</h2>
                </div>
                <div className="h-full w-full rounded-sm bg-blue-500 p-2">
                  <h3 className="text-center text-sm">Your Bid</h3>
                  <h2 className="text-center text-4xl">$45</h2>
                </div>
              </div>
            </div>
            <div className="row-span-2 h-full w-full rounded-md bg-neutral-700 p-4">
              <div className="grid h-full w-full grid-cols-3 gap-2">
                <div className="col-span-2 h-full w-full bg-green-200">
                  <div className="grid h-full w-full grid-rows-2">
                    <div className="flex h-full w-full flex-col rounded-sm bg-neutral-600 p-2">
                      <h3 className="text-center">Current Bid</h3>
                      <div className="flex-1 bg-neutral-500">
                        <h1 className="p-2 text-center text-5xl">$55</h1>
                      </div>
                    </div>
                  </div>
                  <div className=" bg-purple-400">
                    {/* Make this div take up the rest of the height in the box with the green background. */}
                  </div>
                </div>
                <div className="col-span-1 h-full w-full bg-purple-200"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="row-span-3 h-full w-full rounded-lg bg-neutral-800 p-4">
          <div className="grid h-full w-full grid-rows-3 gap-4">
            <div className="h-full w-full rounded bg-neutral-700">
              <p className="mt-3 text-center text-xl">username</p>
            </div>
            <div className="row-span-2 h-full w-full rounded bg-neutral-700">
              <p className="mt-3 text-center text-7xl">$100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
