<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="lg:py-20 p- container">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
          <div class="flex lg:flex-row flex-col justify-between items-center">
            <h1 class="flex-1 text-4xl font-extrabold tracking-tight">mTLS tracing demo!</h1>
            <p class="flex-auto">See more of this project on <a
                class="hover:underline text-indigo-800" href="https://github.com/aldy505/mtls-tracing-demo">GitHub</a>
            </p>
          </div>
          <main class="py-4">
            <RouterView/>
          </main>
        </div>
      </div>
    </div>

  </div>
</template>
