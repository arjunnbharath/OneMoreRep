#!/usr/bin/env node
/**
 * Builds a new Android APK and publishes it with the website so installed
 * apps can update themselves from Settings → App.
 *
 *   npm run apk:publish                 # bump versionCode, keep versionName
 *   npm run apk:publish -- 1.2          # bump versionCode, set versionName 1.2
 *   npm run apk:publish -- 1.2 "Notes"  # ...and attach release notes
 *
 * Steps: bump android/app/build.gradle → npm run build → cap sync → gradle
 * assembleDebug → copy APK to public/downloads/OneMoreRep.apk → write
 * public/downloads/version.json.
 */
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const gradleFile = join(root, 'android', 'app', 'build.gradle')
const downloadsDir = join(root, 'public', 'downloads')
const apkTarget = join(downloadsDir, 'OneMoreRep.apk')
const manifestTarget = join(downloadsDir, 'version.json')

// The APK serves its own files, so API calls must go to the deployed site.
const apiUrl = process.env.VITE_API_URL || 'https://one-more-rep-gamma.vercel.app'

const [, , versionNameArg, ...notesParts] = process.argv
const notes = notesParts.join(' ').trim()

function run(cmd, cwd = root, env = process.env) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit', shell: true, env })
}

// 1. Bump version in build.gradle
let gradle = readFileSync(gradleFile, 'utf8')
const codeMatch = gradle.match(/versionCode\s+(\d+)/)
const nameMatch = gradle.match(/versionName\s+"([^"]+)"/)
if (!codeMatch || !nameMatch) {
  console.error('Could not find versionCode/versionName in android/app/build.gradle')
  process.exit(1)
}
const versionCode = Number(codeMatch[1]) + 1
const versionName = versionNameArg || nameMatch[1]
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`)
writeFileSync(gradleFile, gradle)
console.log(`Version → ${versionName} (code ${versionCode})`)

// 2. Build web + sync + gradle
console.log(`API → ${apiUrl}`)
run('npm run build', root, { ...process.env, VITE_API_URL: apiUrl })
run('npx cap sync android')
if (process.platform === 'win32') {
  // OneDrive turns freshly copied files into placeholders, which Gradle can't read.
  // Mark the synced assets as "always keep on this device".
  try {
    execSync(`attrib +P -U "${join(root, 'android', 'app', 'src', 'main', 'assets')}" /S /D`, { stdio: 'ignore', shell: true })
  } catch {
    // best effort
  }
}
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
// Clean the app module first: incremental packaging leaves stale bytes in the APK.
run(`${gradlew} :app:clean :app:assembleDebug -q`, join(root, 'android'))

// 3. Locate APK (build dir may be redirected outside the repo, see build.gradle)
// The redirected build dir must come first: android/app/build can hold a stale APK from older builds.
const candidates = [
  process.env.LOCALAPPDATA &&
    join(process.env.LOCALAPPDATA, 'onemorerep-android-build', 'app', 'outputs', 'apk', 'debug', 'app-debug.apk'),
  join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
].filter(Boolean)
const apkSource = candidates.find((p) => existsSync(p))
if (!apkSource) {
  console.error('APK not found. Looked in:\n' + candidates.join('\n'))
  process.exit(1)
}

// 4. Publish
mkdirSync(downloadsDir, { recursive: true })
copyFileSync(apkSource, apkTarget)
writeFileSync(
  manifestTarget,
  JSON.stringify(
    {
      versionCode,
      versionName,
      apkUrl: '/downloads/OneMoreRep.apk',
      notes: notes || undefined,
      publishedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + '\n',
)

console.log(`\nPublished ${apkTarget}`)
console.log(`Manifest ${manifestTarget}`)
console.log('Deploy the site and installed apps will see the update in Settings → App.')
