import { reactive, watch, watchEffect } from 'vue'
import { createEventHook } from '@vueuse/core'
import lz from 'lz-string'
import { compileFile } from './compiler/sfcCompiler'

const shouldUpdateContent = createEventHook()

export interface OrchestratorPackage {
  name: string
  description?: string
  version?: string
  url: string
  source?: string
}

export class OrchestratorFile {
  filename: string
  template: string
  script: string
  style: string

  compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  constructor(
    filename: string,
    template: string | undefined,
    script: string | undefined,
    style?: string
  ) {
    this.filename = filename
    this.template = template || ''
    this.script = script || ''
    this.style = style || ''
  }

  get code() {
    return `
      <script setup>
        ${this.script}
      </script>
      <template>
        ${this.template}
      </template>
      `
  }
}

export interface Orchestrator {
  files: {
    [key: string]: OrchestratorFile
  }
  packages: OrchestratorPackage[]
  activeFilename: string
  errors: (string | Error)[]
  runtimeErrors: (string | Error)[]

  readonly activeFile: OrchestratorFile | undefined
  readonly importMap: string
}

/**
 * Main app orchestrator, handles all the files, import maps, and errors
 */
export const orchestrator: Orchestrator = reactive({
  files: {
    'App.vue': new OrchestratorFile('App.vue', '', ''),
  },
  packages: [],
  activeFilename: 'App.vue',
  errors: [],
  runtimeErrors: [],

  get activeFile() {
    return orchestrator.files[this.activeFilename]
  },

  get importMap() {
    const imports = orchestrator.packages.map(
      ({ name, url }) => `"${name}": "${url}"`
    )

    return `
      {
        "imports": {
          ${imports.join(',\n')}
        }
      }
    `
  },
})

/**
 * Setup Watchers
 */

watchEffect(() => {
  if (orchestrator.activeFile) compileFile(orchestrator.activeFile)
})

watch(
  () => orchestrator.activeFilename,
  () => {
    shouldUpdateContent.trigger(null)
  }
)

export function exportState() {
  const files = Object.entries(orchestrator.files).reduce(
    (acc, [name, { template, script }]) => {
      acc[name] = { template, script }
      return acc
    },
    {} as Record<string, any>
  )

  return lz.compressToEncodedURIComponent(
    JSON.stringify({
      packages: orchestrator.packages,
      files,
    })
  )
}

/**
 * Add a file to the orchestrator
 *
 * @param file File content
 */
export function addFile(file: OrchestratorFile) {
  orchestrator.files = {
    ...orchestrator.files,
    [file.filename]: file,
  }

  compileFile(orchestrator.files[file.filename])
}

export function setActiveFile(name: string) {
  orchestrator.activeFilename = name
}

/**
 * Remove a file from the orchestrator
 *
 * @param name Name of file to remove
 */
export function removeFile(name: string) {
  delete orchestrator.files[name]
  setTimeout(() => setActiveFile('App.vue'), 0)
}

/**
 * Remove all files from the orchestrator
 */
export function removeAllFiles() {
  orchestrator.files = {}
}

export const onShouldUpdateContent = shouldUpdateContent.on

// openDemo('default')

// App.vue
const appTemplate = `
<div
  grid="~ flow-col gap-4"
  place="content-center items-center"
  h="screen"
  font="mono"
  >
  <m-button>普通按钮</m-button>
</div>
`
const appScript = ``

const initialPackages = [
  {
    name: 'shuimo-ui',
    source: 'unpkg',
    description: '水墨组件库',
    url: 'https://unpkg.com/shuimo-ui@0.2.9-1/dist/shuimo-ui.mjs',
  },
]

function loadInitialState() {
  removeAllFiles()

  if (location.hash.slice(1)) {
    const { files, packages } = JSON.parse(
      lz.decompressFromEncodedURIComponent(location.hash.slice(1))
    )

    console.log(files, packages)

    if (files && packages) {
      orchestrator.packages = packages

      for (const f in files) {
        console.log(f)
        addFile(new OrchestratorFile(f, files[f].template, files[f].script))
      }
      setActiveFile('App.vue')
      shouldUpdateContent.trigger(null)
    }
  } else {
    orchestrator.packages = initialPackages
    addFile(
      new OrchestratorFile('App.vue', appTemplate.trim(), appScript.trim())
    )
    setActiveFile('App.vue')
    shouldUpdateContent.trigger(null)
    console.log('initialPackages')
  }
}

setTimeout(() => {
  loadInitialState()
}, 0)
