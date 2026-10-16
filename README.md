# ⚛️ React Hooks Kit

مجموعه‌ی کامل کاستوم هوک‌های کاربردی React — **React 19.3 + Vite + TypeScript**.
بیش از **۱۴۰ هوک و تابع کمکی** در `src/hooks`، همه با تایپ کامل، بدون وابستگی خارجی، آماده‌ی کپی در هر پروژه.

## شروع سریع

```bash
npm install
npm run dev        # اجرای دمو (همه‌ی هوک‌ها با مثال زنده در src/App.tsx)
npm run build      # typecheck + build
npm run typecheck  # فقط بررسی تایپ‌ها
```

```tsx
import { useToggle, useFetch, useDebounce } from './hooks'
```

> هر هوک در یک فایل جداست (`src/hooks/<category>/useXxx.ts`)؛ می‌توانی کل پوشه یا فقط فایل موردنظر را در پروژه‌ی دیگر کپی کنی.
> فایل `_internal.ts` (توابع کمکی مشترک) و `utils/useLatest.ts` و `utils/useIsomorphicLayoutEffect.ts` وابستگی چند هوک هستند.

## ساختار پوشه

```
src/
├─ App.tsx            ← دموی زنده + کامنت فارسی «چطور استفاده کنم» برای همه‌ی هوک‌ها
└─ hooks/
   ├─ index.ts        ← خروجی همه‌ی هوک‌ها
   ├─ _internal.ts    ← helperهای مشترک (deepEqual, resolveTarget, …)
   ├─ state/  lifecycle/  timing/  storage/  dom/  browser/  network/  forms/  utils/
```

## فهرست

| دسته | هوک‌ها |
|---|---|
| [State](#۱-state) | useToggle · useBoolean · useDisclosure · useCounter · useArray · useMap · useSet · useObjectState · useHistoryState · usePrevious · useDefault · useQueue · useStep · useCycle · useForceUpdate · useRenderCount · useIsFirstRender · useControllableState |
| [Lifecycle](#۲-lifecycle) | useMount · useUnmount · useUpdateEffect · useIsMounted · useDeepCompareEffect · useDeepCompareMemo · useCustomCompareEffect · useMemoCompare · useAsyncEffect · useWhyDidYouUpdate · useLogger |
| [Timing](#۳-timing) | useDebounce · useDebouncedState · useDebouncedCallback · useThrottle · useThrottledCallback · useTimeout · useInterval · useCountdown · useStopwatch · useNow · useRelativeTime · useAnimationFrame · useRafState · useIdle · useCountUp · useTypewriter · useDelayedLoading |
| [Storage & URL](#۴-storage--url) | useLocalStorage · useSessionStorage · useStorage · useCookie · useQueryParam · useQueryParams · useHash · useBroadcastChannel · useIndexedDB |
| [DOM](#۵-dom--events--gestures) | useEventListener · useWindowSize · useBreakpoint · useScroll · useScrollIntoView · useScrollLock · useScrollSpy · useOnClickOutside · useHover · useFocus · useFocusWithin · useKeyPress · useHotkeys · useKeySequence · useLongPress · useMouse · useResizeObserver · useElementSize · useMeasure · useIntersectionObserver · useInView · useInfiniteScroll · useMutationObserver · useDraggable · useSwipe · useDropZone · useFileDialog · useVirtualList |
| [Browser APIs](#۶-browser-apis) | useMediaQuery (+۵ میان‌بر) · useColorScheme · useDarkMode · useDocumentTitle · useFavicon · usePageVisibility · useWindowFocus · useIsClient · useBeforeUnload · usePreferredLanguages · useClipboard · useFullscreen · useGeolocation · useBattery · useDeviceOrientation · useDeviceMotion · useScreenOrientation · useSpeechSynthesis · useSpeechRecognition · useNotification · useShare · useVibrate · usePermission · useWakeLock · useEyeDropper · useTextSelection · useUserMedia · useMediaDevices · useMediaControls · useAudio |
| [Network & Async](#۷-network--async) | useAsync · useFetch · useMutation · usePolling · useNetwork · useOnline · useWebSocket · useEventSource · useScript · useImage · useWebWorker |
| [Forms & Lists](#۸-forms--lists) | useForm · useInput · useSelection · usePagination · useSort · useSearch |
| [Utils](#۹-utils) | useLatest · useEventCallback · useConst · useMergeRefs · useLockFn · useAbortController · createStore/useStore · createEmitter/useEmitter/useEmitterEvent · useStateMachine · useToasts · useCssVariable · useIsomorphicLayoutEffect |

---

## ۱) State

### `useToggle(initial = false)`
```tsx
const [on, toggle, setOn] = useToggle(false)
toggle()        // برعکس
toggle(true)    // مقدار مشخص
<button onClick={toggle} />   // امن است؛ آرگومان غیر boolean نادیده گرفته می‌شود
```

### `useBoolean(initial = false)` / `useDisclosure(initial = false)`
```tsx
const { value, setTrue, setFalse, toggle, set } = useBoolean()
const { isOpen, open, close, toggle } = useDisclosure()   // مودال، دراور، دراپ‌داون
```

### `useCounter(initial = 0, { min, max, step })`
```tsx
const { count, increment, decrement, reset, set } = useCounter(5, { min: 0, max: 10, step: 2 })
increment()      // +step
increment(3)     // +3
```
مقدار همیشه بین `min` و `max` می‌ماند.

### `useArray(initial = [])`
```tsx
const [list, a] = useArray<string>(['a'])
a.push('b', 'c')  a.unshift('x')  a.pop()  a.shift()
a.insert(1, 'm')  a.update(0, v => v + '!')  a.removeAt(2)
a.remove(item => item === 'b')  a.filter(fn)  a.map(fn)
a.move(0, 2)  a.swap(0, 1)  a.sort()  a.reverse()  a.clear()  a.reset()  a.set([...])
```
همه‌ی متدها immutable‌اند و identity ثابت دارند.

### `useMap(initialEntries)` / `useSet(initialItems)`
```tsx
const [map, { set, setAll, merge, remove, clear, reset }] = useMap<string, number>([['a', 1]])
const [set, { add, remove, toggle, has, clear, reset, set: replace }] = useSet<number>([1])
```
هر تغییر یک `Map`/`Set` جدید می‌سازد تا React رندر کند.

### `useObjectState(initial)`
```tsx
const [state, patch, reset, setState] = useObjectState({ name: '', age: 0 })
patch({ age: 20 })                 // merge جزئی
patch(s => ({ age: s.age + 1 }))
```

### `useHistoryState(initial, capacity = 100)`
```tsx
const { state, set, undo, redo, canUndo, canRedo, clear, reset, past, future } = useHistoryState('')
```

### `usePrevious(value)`
مقدار رندر قبلی (`undefined` در رندر اول).

### `useDefault(initial, defaultValue)`
```tsx
const [name, setName] = useDefault<string | null>(null, 'Guest')   // name === 'Guest' تا وقتی null است
```

### `useQueue(initial = [])`
```tsx
const { queue, add, remove, clear, first, last, size } = useQueue<number>()
const item = remove()   // اولین را حذف و برمی‌گرداند
```

### `useStep(maxStep, initialStep = 1)`
```tsx
const { step, next, prev, goTo, reset, canNext, canPrev, isFirst, isLast, progress } = useStep(4)
```

### `useCycle(values, initialIndex = 0)`
```tsx
const { value, index, next, prev, setIndex, setValue } = useCycle(['light', 'dark', 'system'])
```

### `useForceUpdate()` · `useRenderCount()` · `useIsFirstRender()`
```tsx
const update = useForceUpdate()      // update() → رندر مجدد
const renders = useRenderCount()     // در StrictMode توسعه دو برابر شمرده می‌شود
const first = useIsFirstRender()
```

### `useControllableState({ value, defaultValue, onChange })`
برای ساخت کامپوننت‌های UI که هم controlled و هم uncontrolled کار می‌کنند.
```tsx
const [checked, setChecked] = useControllableState({ value: props.checked, defaultValue: false, onChange: props.onChange })
```

---

## ۲) Lifecycle

| هوک | کاربرد |
|---|---|
| `useMount(fn)` | یک‌بار بعد از mount (می‌تواند cleanup برگرداند) |
| `useUnmount(fn)` | هنگام unmount (همیشه آخرین نسخه‌ی fn) |
| `useUpdateEffect(effect, deps)` | مثل `useEffect` ولی بار اول اجرا نمی‌شود (StrictMode-safe) |
| `useIsMounted()` | `() => boolean`؛ جلوگیری از setState بعد از unmount |
| `useDeepCompareEffect(effect, deps)` | deps با مقایسه‌ی عمیق (آبجکت/آرایه‌ی inline امن است) |
| `useDeepCompareMemo(factory, deps)` | `useMemo` با deps عمیق |
| `useCustomCompareEffect(effect, deps, compare)` | مقایسه‌ی دلخواه: `compare(prevDeps, nextDeps)` |
| `useMemoCompare(next, compare)` | تا وقتی `compare` درست است همان reference قبلی را می‌دهد |
| `useAsyncEffect(async (isCancelled) => …, deps)` | effect با async/await؛ بعد از هر `await` شرط `isCancelled()` را چک کن |
| `useWhyDidYouUpdate(name, props)` | لاگ می‌کند کدام prop رندر را باعث شد |
| `useLogger(name, ...values)` | لاگ mount / update / unmount |

```tsx
useAsyncEffect(async (cancelled) => {
  const user = await api.getUser(id)
  if (!cancelled()) setUser(user)
}, [id])

useDeepCompareEffect(() => { fetchData(filters) }, [filters])   // filters = { page, q } جدید در هر رندر
```

---

## ۳) Timing

### `useDebounce(value, delay = 300)` / `useDebouncedState(initial, delay)`
```tsx
const debounced = useDebounce(search, 400)
const [value, debounced, setValue] = useDebouncedState('', 400)
```

### `useDebouncedCallback(fn, delay = 300, { leading, trailing, maxWait })`
```tsx
const save = useDebouncedCallback((text: string) => api.save(text), 800)
save('hello')
save.flush()       // همین حالا اجرا کن
save.cancel()      // لغو
save.isPending()
```
identity ثابت دارد و هنگام unmount لغو می‌شود.

### `useThrottle(value, interval = 300)` / `useThrottledCallback(fn, interval, { leading, trailing })`
حداکثر یک‌بار در هر `interval` میلی‌ثانیه (مناسب scroll/resize/mousemove).

### `useTimeout(callback, delay | null)`
```tsx
const { clear, reset, isPending } = useTimeout(() => setShow(false), 3000)
```

### `useInterval(callback, delay | null, { immediate })`
`delay = null` یعنی متوقف.
```tsx
useInterval(() => setTick(t => t + 1), running ? 1000 : null)
```

### `useCountdown(from, { interval = 1000, step = 1, autoStart, onTick, onComplete })`
```tsx
const { count, isRunning, isFinished, start, pause, resume, reset } = useCountdown(60)
start()      // از مقدار اولیه;  start(30) از ۳۰
```

### `useStopwatch({ autoStart, updateInterval = 50 })`
```tsx
const { time, isRunning, laps, start, pause, toggle, reset, lap } = useStopwatch()
formatStopwatch(time)   // "01:23.45"
```

### `useNow(interval = 1000)` / `useRelativeTime(date, { locale, updateInterval })`
```tsx
const now = useNow(1000)
useRelativeTime(post.createdAt, { locale: 'fa' })   // «۵ دقیقه پیش»
```

### `useAnimationFrame(cb(deltaMs, time), enabled = true)` / `useRafState(initial)`
حلقه‌ی انیمیشن؛ `useRafState` مثل `useState` ولی آپدیت‌ها حداکثر یکی در هر فریم.

### `useIdle(timeout = 60000, { events, initialState })`
`true` وقتی کاربر `timeout` میلی‌ثانیه هیچ فعالیتی نداشته (auto-logout، حالت screensaver).

### `useCountUp(end, { start, duration, decimals, enabled, easing })`
عدد انیمیشنی از مقدار فعلی تا `end`.

### `useTypewriter(text, { speed = 50, delay, loop, pause })`
```tsx
const { displayed, done } = useTypewriter('Hello!')
```

### `useDelayedLoading(loading, { delay = 200, minDuration = 500 })`
اسپینر فقط اگر لود از `delay` طولانی‌تر شد نشان داده می‌شود و حداقل `minDuration` می‌ماند (جلوگیری از فلش).

---

## ۴) Storage & URL

### `useLocalStorage(key, initial, { serializer })` / `useSessionStorage(...)` / `useStorage(type, key, initial)`
```tsx
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light')
setTheme(t => (t === 'light' ? 'dark' : 'light'))
```
- بین تب‌ها و کامپوننت‌های هم‌کلید همگام می‌شود.
- JSON پیش‌فرض است؛ با `serializer: { parse, stringify }` تغییر بده.
- در SSR / حالت private که storage بلاک است خطا نمی‌دهد و `initial` را برمی‌گرداند.

### `useCookie(name, defaultValue)` + `getCookie / setCookie / deleteCookie`
```tsx
const [token, setToken, removeToken] = useCookie('token')
setToken('abc', { days: 7, path: '/', secure: true, sameSite: 'lax' })
```

### `useQueryParam(key, default, { replace = true })` / `useQueryParams()`
```tsx
const [tab, setTab] = useQueryParam('tab', 'home')          // ?tab=home
const [params, setParams] = useQueryParams()
setParams({ page: 2, q: 'react' })                          // merge؛ null یا '' = حذف
setParams({}, { reset: true })                              // پاک‌کردن همه
```
`replace: false` یعنی هر تغییر یک entry جدید در history.

### `useHash()`
`const [hash, setHash] = useHash()` — مقدار `#hash` بدون `#`.

### `useBroadcastChannel<T>(name, onMessage?)`
`const { post, lastMessage, isSupported } = useBroadcastChannel('chat')` — ارتباط بین تب‌ها.

### `useIndexedDB<T>(dbName, storeName)`
```tsx
const db = useIndexedDB<Note>('my-app', 'notes')
if (db.ready) { await db.set('n1', note); await db.get('n1'); await db.keys(); await db.getAll(); await db.remove('n1'); await db.clear() }
```

---

## ۵) DOM / Events / Gestures

### `useEventListener(type, handler, target?, options?)`
`target`: پیش‌فرض `window`، یا `document`، المنت، یا `ref`.
```tsx
useEventListener('resize', onResize)
useEventListener('keydown', onKey, document)
useEventListener('click', onClick, buttonRef)
```

### `useWindowSize()` / `useBreakpoint(breakpoints?)`
```tsx
const { width, height } = useWindowSize()
const { current, isAtLeast, isBelow } = useBreakpoint()      // sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536
isAtLeast('md')
useBreakpoint({ tablet: 700, desktop: 1100 })                // breakpoint دلخواه
```

### `useScroll(target?, { idle, offset })` / `useScrollIntoView(options)`
```tsx
const { x, y, directionY, isScrolling, arrived, scrollTo } = useScroll()      // window
const s = useScroll(boxRef)                                                   // یک المنت
arrived.bottom   // به انتها رسیده؟  (با offset)
const goTo = useScrollIntoView(); goTo(sectionRef)
```

### `useScrollLock(locked = true, target?)`
قفل اسکرول body با جبران عرض scrollbar (مودال).

### `useScrollSpy(ids, { offset })`
id بخشی که در دید است → برای highlight فهرست مطالب.

### `useOnClickOutside(ref | refs[], handler, { events, enabled })`
```tsx
useOnClickOutside(menuRef, () => setOpen(false), { enabled: open })
```

### `useHover()` · `useFocus()` · `useFocusWithin()`
```tsx
const [ref, hovered] = useHover<HTMLDivElement>()
<div ref={ref} />
```

### `useKeyPress(keys, handler?, { event, target, preventDefault, enabled })`
```tsx
const pressed = useKeyPress('Escape')
useKeyPress(['Enter'], submit)
```
کلیدها هم `e.key` (`"Enter"`, `"a"`) و هم `e.code` (`"KeyA"`, `"Space"`) هستند.

### `useHotkeys(combos, handler, { preventDefault = true, enabled, enableOnFormTags, target })`
```tsx
useHotkeys('mod+k', openSearch)                // mod = ⌘ در مک / Ctrl در بقیه
useHotkeys(['ctrl+s', 'meta+s'], save)
useHotkeys('shift+/', showHelp)
useHotkeys('esc', close, { enableOnFormTags: true })
```
نام‌های ویژه: `esc, space, up, down, left, right, del, return, plus, comma, dot`.

### `useKeySequence(sequence, onMatch, { timeout })`
`useKeySequence(['ArrowUp','ArrowUp','ArrowDown','ArrowDown','b','a'], easterEgg)`

### `useLongPress(callback, { delay = 400, onStart, onCancel, onFinish })`
`<button {...useLongPress(() => remove(), { delay: 600 })}>` — props را spread کن.

### `useMouse(target?)`
`{ x, y, pageX, pageY, elementX, elementY, isInside }` (throttle با rAF).

### `useResizeObserver(target, cb)` · `useElementSize()` · `useMeasure()`
```tsx
const [ref, { width, height }] = useElementSize<HTMLDivElement>()
const [ref, rect] = useMeasure<HTMLDivElement>()        // x, y, width, height, top, left, …
```

### `useIntersectionObserver(options)` / `useInView(options)`
```tsx
const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5, freezeOnceVisible: true })   // lazy-load / انیمیشن ورود
const [ref, entry] = useIntersectionObserver()
```

### `useInfiniteScroll(onLoadMore, { hasMore, loading, root, rootMargin })`
```tsx
const sentinel = useInfiniteScroll(loadMore, { hasMore, loading })
{items.map(...)}  <div ref={sentinel} />
```

### `useMutationObserver(target, callback, options)`
تغییرات DOM (فرزندان، attribute، متن).

### `useDraggable({ initial, bounds, axis, onDragEnd })`
```tsx
const { bind, x, y, isDragging, setPosition, reset } = useDraggable({ bounds: [0, 0, 300, 200] })
<div {...bind}>drag</div>        // bind.style شامل transform است؛ با style خودت merge کن
```

### `useSwipe(target, { threshold = 50, onSwipe, onSwipeEnd })`
`{ direction, isSwiping, distanceX, distanceY }` — برای تاچ، `touch-action` المنت را `none` یا `pan-y` بگذار.

### `useDropZone(target, { accept, multiple, maxSize, onDrop })` / `useFileDialog({ accept, multiple, capture, directory })`
```tsx
const { isOver, files, rejected } = useDropZone(ref, { accept: ['image/*', '.pdf'], maxSize: 5e6 })
const { open, files } = useFileDialog({ accept: 'image/*', multiple: true }); await open()
```

### `useVirtualList(list, { itemHeight, height, overscan })`
```tsx
const { virtualItems, containerProps, wrapperProps, scrollTo } = useVirtualList(list, { itemHeight: 32, height: 400 })
<div {...containerProps}><div {...wrapperProps}>
  {virtualItems.map(({ data, index }) => <div key={index} style={{ height: 32 }}>{data}</div>)}
</div></div>
```
ارتفاع ردیف‌ها باید ثابت باشد.

---

## ۶) Browser APIs

### `useMediaQuery(query, defaultValue = false)`
```tsx
const wide = useMediaQuery('(min-width: 900px)')
```
میان‌بر‌ها: `usePrefersReducedMotion()` · `useIsTouchDevice()` · `useIsLandscape()` · `usePrefersHighContrast()` · `useIsPrinting()`

### `useColorScheme()` / `useDarkMode({ storageKey, defaultMode, darkClass, attribute })`
```tsx
const { mode, resolved, isDark, setMode, toggle } = useDarkMode()   // mode: 'light' | 'dark' | 'system'
```
در `localStorage` ذخیره می‌شود و روی `<html>` کلاس `dark`، attribute `data-theme` و `color-scheme` را ست می‌کند.

### `useDocumentTitle(title)` · `useFavicon(href)` · `usePageVisibility()` · `useWindowFocus()` · `useIsClient()`
```tsx
useDocumentTitle(`(${unread}) Inbox`)
const visibility = usePageVisibility()   // 'visible' | 'hidden'
const isClient = useIsClient()           // false در SSR/hydration
```

### `useBeforeUnload(enabled)`
هشدار «تغییرات ذخیره نشده» هنگام بستن/رفرش تب. `useBeforeUnload(isDirty)`

### `usePreferredLanguages()`
`['fa-IR', 'en-US']`

### `useClipboard({ timeout = 2000 })`
```tsx
const { copy, paste, copied, text, error, isSupported } = useClipboard()
<button onClick={() => copy('text')}>{copied ? 'Copied!' : 'Copy'}</button>
```
اگر `navigator.clipboard` نبود از fallback قدیمی استفاده می‌کند.

### `useFullscreen(target?)`
`const { isFullscreen, enter, exit, toggle, isSupported } = useFullscreen(videoRef)`

### `useGeolocation({ enabled, watch, enableHighAccuracy, timeout, maximumAge })`
`const { coords, loading, error, timestamp } = useGeolocation({ enabled: clicked })` — تا `enabled` نشود مجوز نمی‌خواهد.

### `useBattery()`
`{ isSupported, loading, level (0..1), charging, chargingTime, dischargingTime }` — فقط Chromium.

### `useDeviceOrientation()` · `useDeviceMotion()` · `useScreenOrientation()`
```tsx
const { alpha, beta, gamma, requestPermission } = useDeviceOrientation()   // iOS: requestPermission() را در کلیک صدا بزن
const { acceleration, rotationRate } = useDeviceMotion()
const { type, angle } = useScreenOrientation()
```

### `useSpeechSynthesis()` / `useSpeechRecognition({ lang, continuous, interimResults })`
```tsx
const { speak, cancel, pause, resume, speaking, voices } = useSpeechSynthesis()
speak('Hello', { lang: 'en-US', rate: 1 })

const { start, stop, reset, transcript, interim, listening, error, isSupported } = useSpeechRecognition({ lang: 'fa-IR' })
```

### `useNotification()` · `useShare()` · `useVibrate()`
```tsx
const { permission, request, notify } = useNotification(); await request(); notify('Hi', { body: '…' })
const { share, isSupported } = useShare(); share({ title, url })
const { vibrate, stop } = useVibrate(); vibrate([100, 50, 100])
```

### `usePermission(name)` · `useWakeLock()` · `useEyeDropper()`
```tsx
const state = usePermission('geolocation')      // 'granted' | 'denied' | 'prompt' | 'unsupported'
const { request, release, active } = useWakeLock()
const { open } = useEyeDropper(); const hex = await open()
```

### `useTextSelection()`
`{ text, rect }` متن انتخاب‌شده‌ی صفحه (برای toolbar شناور).

### `useUserMedia(constraints)` / `useMediaDevices()`
```tsx
const { stream, start, stop, error, isActive } = useUserMedia({ video: true, audio: false })
videoRef.current.srcObject = stream
const { cameras, microphones, speakers } = useMediaDevices()
```

### `useMediaControls(ref)` / `useAudio(src, { loop, autoPlay })`
```tsx
const m = useMediaControls(videoRef)
// m.playing, currentTime, duration, volume, muted, playbackRate, ended, waiting, buffered
// m.play() pause() toggle() seek(t) setVolume(v) setMuted(b) setRate(r)
const audio = useAudio('/ding.mp3'); audio.play()
```

---

## ۷) Network & Async

### `useAsync(fn, { immediate = true, args, deps, initialData, retries, retryDelay, onSuccess, onError })`
```tsx
const user = useAsync(() => api.getUser(id), { deps: [id] })
user.data  user.error  user.loading  user.status  // 'idle'|'pending'|'success'|'error'

const save = useAsync(api.save, { immediate: false })
await save.execute(payload)        // هرگز throw نمی‌کند؛ خطا در save.error
```
پاسخ‌های قدیمی (race condition) نادیده گرفته می‌شوند.

### `useFetch<T>(url, options)`
```tsx
const { data, loading, error, refetch, abort, mutate } = useFetch<User[]>('/api/users')

useFetch(`/api/users/${id}`, { enabled: !!id, cacheTime: 30_000, retries: 2, refetchInterval: 10_000 })
useFetch('/api/items', { method: 'POST', body: { name: 'x' } })      // آبجکت → JSON خودکار
```
گزینه‌ها: `method, headers, body, parse ('json'|'text'|'blob'|'arrayBuffer'|fn), enabled, cacheTime, refetchInterval, retries, retryDelay, initialData, onSuccess, onError`.
با تغییر url درخواست قبلی abort می‌شود. خطای HTTP از نوع `HttpError` (`status`, `body`) است. `clearFetchCache(prefix?)` کش را پاک می‌کند.

### `useMutation(fn, { onSuccess, onError, onSettled })`
```tsx
const { mutate, mutateAsync, isPending, isSuccess, data, error, reset } = useMutation((todo: Todo) => api.create(todo))
mutate(todo)                       // fire-and-forget
const created = await mutateAsync(todo)   // throw می‌کند
```

### `usePolling(fn, interval, { enabled, immediate, stopWhen, pauseWhenHidden, onError })`
```tsx
const { data, isPolling, start, stop, pollNow } = usePolling(() => api.status(id), 2000, { stopWhen: r => r.done })
```
درخواست بعدی فقط بعد از تمام شدن قبلی شروع می‌شود.

### `useNetwork()` / `useOnline()`
`{ online, effectiveType, downlink, rtt, saveData, since }`

### `useWebSocket<T>(url, options)`
```tsx
const { status, data, history, send, connect, disconnect } = useWebSocket<Msg>('wss://…', {
  reconnect: true, reconnectAttempts: 10, reconnectInterval: 2000,
  heartbeat: { message: 'ping', interval: 15000 }, onMessage: (d) => {},
})
send({ type: 'hi' })    // آبجکت → JSON
```
`status`: `'connecting' | 'open' | 'closing' | 'closed'`.

### `useEventSource<T>(url, { events, withCredentials, enabled })`
```tsx
const { data, status, error, close } = useEventSource<{ price: number }>('/api/stream', { events: ['tick'] })
```

### `useScript(src, options)` / `useImage(src)`
```tsx
const status = useScript('https://…/lib.js')       // 'idle'|'loading'|'ready'|'error'  (یک‌بار برای همه‌ی کامپوننت‌ها)
const { status, image } = useImage('/photo.jpg')   // 'idle'|'loading'|'loaded'|'error'
```

### `useWebWorker(fn, { timeout })`
```tsx
const { run, terminate, status } = useWebWorker((n: number) => { let s = 0; for (let i = 0; i < n; i++) s += i; return s })
const result = await run(1e9)
```
`fn` باید **خالص** باشد (به متغیرهای بیرونی دسترسی ندارد؛ چون serialize می‌شود).

---

## ۸) Forms & Lists

### `useForm({ initialValues, validators, validate, onSubmit, validateOn })`
```tsx
const form = useForm({
  initialValues: { email: '', age: 18, agree: false },
  validators: {
    email: v => !v.includes('@') && 'ایمیل نامعتبر',
    age: v => v < 18 && 'حداقل ۱۸',
  },
  // یا validate: async (values) => ({ email: '…' })
  onSubmit: async (values, { reset, setErrors }) => { await api.save(values); reset() },
})

<form onSubmit={form.handleSubmit}>
  <input {...form.getFieldProps('email')} />
  {form.touched.email && form.errors.email}
  <input type="checkbox" {...form.getFieldProps('agree', { type: 'checkbox' })} />
  <button disabled={form.isSubmitting}>Send</button>
</form>
```
خروجی: `values, errors, touched, dirty, isValid, isSubmitting, submitCount, setValue, setValues, setFieldError, setFieldTouched, setErrors, handleChange, handleBlur, handleSubmit, getFieldProps, validate, reset`.
`validateOn`: `'change'` (پیش‌فرض) | `'blur'` | `'submit'`.

### `useInput(initial, { transform, validate })`
```tsx
const code = useInput('', { transform: v => v.toUpperCase(), validate: v => v.length < 6 && 'کوتاه است' })
<input {...code.bind} />   {code.touched && code.error}
```

### `useSelection(items, { getKey, multiple, initialSelected })`
```tsx
const sel = useSelection(rows, { getKey: r => r.id })
sel.isSelected(row)  sel.toggle(row)  sel.toggleAll()  sel.clear()  sel.selected  sel.isAllSelected  sel.isPartiallySelected
```

### `usePagination({ total, pageSize, initialPage, siblings, boundaries })`
```tsx
const p = usePagination({ total: 237, pageSize: 10 })
p.pages          // [1, 'dots', 4, 5, 6, 'dots', 24]
p.page  p.pageCount  p.setPage(3)  p.next()  p.prev()  p.first()  p.last()  p.setPageSize(20)
data.slice(p.startIndex, p.endIndex)
```

### `useSort(items, { key, direction, compare })`
```tsx
const { sorted, sortKey, direction, toggleSort, setSort } = useSort(users, { key: 'name' })
<th onClick={() => toggleSort('age')}>
```
اعداد عددی و رشته‌ها با `localeCompare` (numeric) مرتب می‌شوند.

### `useSearch(items, { keys, debounce, initialQuery })`
```tsx
const { query, setQuery, results, isSearching } = useSearch(users, { keys: ['name', 'email'] })
```
جست‌وجوی چندکلمه‌ای، بدون حساسیت به حروف، با debounce.

---

## ۹) Utils

| هوک | کاربرد |
|---|---|
| `useLatest(value)` | `ref` که همیشه آخرین مقدار را دارد (برای timer/listener بدون stale closure) |
| `useEventCallback(fn)` | تابعی با identity ثابت که همیشه آخرین `fn` را صدا می‌زند |
| `useConst(() => init)` | مقدار lazy که فقط یک‌بار ساخته می‌شود |
| `useMergeRefs(a, b, …)` | چند ref (آبجکتی/callback) را یکی می‌کند |
| `useLockFn(asyncFn)` | `{ run, locked }`؛ تا اجرا تمام نشده، فراخوانی مجدد نادیده گرفته می‌شود (ضد double submit) |
| `useAbortController()` | `{ getSignal, abort }`؛ هر `getSignal()` قبلی را abort می‌کند؛ هنگام unmount هم abort |
| `useIsomorphicLayoutEffect` | `useLayoutEffect` در مرورگر، `useEffect` در سرور |
| `useCssVariable(name, initial, target?)` | `[value, set]` برای CSS custom property |

### `createStore(initial)` / `useStore(store, selector?, isEqual?)`
استیت سراسری سبک (شبیه zustand، بدون Provider، قابل استفاده بیرون از React).
```tsx
export const cartStore = createStore({ items: [] as Item[], coupon: '' })

const count = useStore(cartStore, s => s.items.length)       // فقط وقتی count عوض شود رندر می‌شود
cartStore.setState(s => ({ items: [...s.items, item] }))
cartStore.getState()   cartStore.subscribe(fn)   cartStore.reset()
```

### `createEmitter<Events>()` / `useEmitter<Events>()` / `useEmitterEvent(emitter, event, handler)`
event bus تایپ‌دار.
```tsx
type Events = { login: { user: string }; logout: void }
export const bus = createEmitter<Events>()          // سراسری
bus.emit('login', { user: 'ali' })
useEmitterEvent(bus, 'login', ({ user }) => toast(user))
```

### `useStateMachine({ initial, states })`
```tsx
const { state, send, can, reset } = useStateMachine({
  initial: 'idle',
  states: { idle: { on: { FETCH: 'loading' } }, loading: { on: { OK: 'done', FAIL: 'idle' } }, done: {} },
})
send('FETCH')   can('OK')
```
هر state می‌تواند `onEnter` / `onExit` هم داشته باشد.

### `useToasts({ duration = 3000, max = 5 })`
```tsx
const { toasts, add, remove, clear } = useToasts()
add('ذخیره شد', { type: 'success', duration: 2000 })   // duration: 0 = ماندگار
```

---

## نکات مهم

- **SSR:** هوک‌ها در سرور خطا نمی‌دهند (دسترسی به `window` داخل effect یا با گارد `isBrowser` است).
- **StrictMode:** همه‌ی effectها cleanup دارند و با اجرای دوباره در حالت توسعه سازگارند.
- **Stale closure:** هوک‌های callback-محور (`useInterval`, `useEventListener`, `useDebouncedCallback` …) همیشه آخرین نسخه‌ی callback را صدا می‌زنند؛ نیازی به `useCallback` نیست.
- **مجوزها:** هوک‌های حسگر/دوربین/نوتیفیکیشن/موقعیت‌مکانی تا وقتی خودت صدا نزنی (یا `enabled` نکنی) مجوز نمی‌خواهند. بیشتر آن‌ها فقط روی HTTPS یا localhost کار می‌کنند.
- **پشتیبانی مرورگر:** `useBattery`, `useEyeDropper`, `useSpeechRecognition`, `useWakeLock`, `useShare` به مرورگر بستگی دارند؛ خروجی `isSupported` را چک کن.
- **تایپ‌اسکریپت:** همه‌ی هوک‌ها generic و کاملاً تایپ‌شده‌اند (`useFetch<User[]>`, `useArray<string>`, …).
