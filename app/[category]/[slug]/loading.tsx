export default function CalculatorLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-4 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-4 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>

      {/* H1 skeleton */}
      <div className="h-10 w-80 rounded bg-gray-200 mb-6" />

      {/* BLUF intro skeleton */}
      <div className="max-w-content mx-auto mb-8 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>

      {/* Calculator widget skeleton */}
      <div className="mx-auto max-w-calculator rounded-xl border border-gray-200 bg-white shadow-sm p-6 my-8">
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
          <div className="h-11 w-28 rounded-lg bg-gray-300 mt-6" />
        </div>
      </div>

      {/* Article content skeleton */}
      <div className="max-w-content mx-auto space-y-6 mt-12">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="h-7 w-64 rounded bg-gray-200 mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
