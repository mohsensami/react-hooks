/**
 * ════════════════════════════════════════════════════════════════════
 *  React Hooks Kit – دمو و راهنمای استفاده از تمام هوک‌ها
 * ════════════════════════════════════════════════════════════════════
 *  • همه هوک‌ها از  './hooks'  ایمپورت می‌شوند  (فایل src/hooks/index.ts)
 *  • هر کارت = یک هوک (یا چند هوک هم‌خانواده) با مثال زنده
 *  • بالای هر دمو با کامنت فارسی توضیح داده شده «چطور استفاده کنم»
 *  • توضیح کامل‌تر همه‌ی پارامترها و خروجی‌ها در README.md هست
 * ════════════════════════════════════════════════════════════════════
 */
import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  // state
  useToggle, useBoolean, useDisclosure, useCounter, useArray, useMap, useSet, useObjectState, useHistoryState,
  usePrevious, useDefault, useQueue, useStep, useCycle, useForceUpdate, useRenderCount, useIsFirstRender, useControllableState,
  // lifecycle
  useMount, useUnmount, useUpdateEffect, useIsMounted, useDeepCompareEffect, useDeepCompareMemo, useCustomCompareEffect,
  useMemoCompare, useAsyncEffect, useWhyDidYouUpdate, useLogger,
  // timing
  useDebounce, useDebouncedState, useDebouncedCallback, useThrottle, useThrottledCallback, useTimeout, useInterval, useCountdown,
  useStopwatch, formatStopwatch, useNow, useRelativeTime, useAnimationFrame, useRafState, useIdle, useCountUp, useTypewriter, useDelayedLoading,
  // storage
  useLocalStorage, useSessionStorage, useCookie, useQueryParam, useQueryParams, useHash, useBroadcastChannel, useIndexedDB,
  // dom
  useEventListener, useWindowSize, useBreakpoint, useScroll, useScrollIntoView, useScrollLock, useScrollSpy, useOnClickOutside,
  useHover, useFocus, useFocusWithin, useKeyPress, useHotkeys, useKeySequence, useLongPress, useMouse, useResizeObserver,
  useElementSize, useMeasure, useInView, useInfiniteScroll, useMutationObserver, useDraggable, useSwipe,
  useDropZone, useFileDialog, useVirtualList,
  // browser
  useMediaQuery, usePrefersReducedMotion, useIsTouchDevice, useColorScheme, useDarkMode, useDocumentTitle, useFavicon,
  usePageVisibility, useWindowFocus, useIsClient, useBeforeUnload, usePreferredLanguages, useClipboard, useFullscreen,
  useGeolocation, useBattery, useDeviceOrientation, useDeviceMotion, useScreenOrientation, useSpeechSynthesis,
  useSpeechRecognition, useNotification, useShare, useVibrate, usePermission, useWakeLock, useEyeDropper, useTextSelection,
  useUserMedia, useMediaDevices, useMediaControls, useAudio,
  // network
  useAsync, useFetch, useMutation, usePolling, useNetwork, useWebSocket, useEventSource, useScript, useImage, useWebWorker,
  // forms
  useForm, useInput, useSelection, usePagination, useSort, useSearch,
  // utils
  useLatest, useEventCallback, useConst, useMergeRefs, useLockFn, useAbortController, createStore, useStore,
  useEmitter, useEmitterEvent, useStateMachine, useToasts, useCssVariable, useIsomorphicLayoutEffect,
} from './hooks'

/* ───────────────────────── ابزارهای ظاهری دمو ───────────────────────── */

function Card({ name, desc, children }: { name: string; desc: string; children: ReactNode }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p className="desc">{desc}</p>
      {children}
    </div>
  )
}
const Out = ({ children }: { children: ReactNode }) => <div className="out">{children}</div>
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ════════════════════════════════════════════════════════════════════
 *  1) STATE – هوک‌های مدیریت state
 * ════════════════════════════════════════════════════════════════════ */

// useToggle: یک boolean که toggle دارد.
//   const [value, toggle, setValue] = useToggle(initial)
//   toggle() → برعکس می‌کند | toggle(true) → مقدار مشخص | می‌شود مستقیم به onClick داد
function UseToggleDemo() {
  const [on, toggle, setOn] = useToggle(false)
  return (
    <Card name="useToggle" desc="boolean با toggle؛ مناسب منو، سوییچ، آکاردئون">
      <div className="row">
        <button onClick={toggle}>toggle</button>
        <button onClick={() => setOn(true)}>set true</button>
        <button onClick={() => toggle(false)}>toggle(false)</button>
      </div>
      <Out>{String(on)}</Out>
    </Card>
  )
}

// useBoolean: مثل بالا ولی با اسم‌های خوانا  { value, setTrue, setFalse, toggle, set }
// useDisclosure: مخصوص مودال/دراور  { isOpen, open, close, toggle }
function UseBooleanDemo() {
  const { value, setTrue, setFalse, toggle } = useBoolean(false)
  const modal = useDisclosure()
  return (
    <Card name="useBoolean / useDisclosure" desc="boolean با متدهای setTrue / setFalse؛ disclosure برای مودال">
      <div className="row">
        <button onClick={setTrue}>setTrue</button>
        <button onClick={setFalse}>setFalse</button>
        <button onClick={toggle}>toggle</button>
        <button onClick={modal.open}>باز کردن مودال</button>
      </div>
      <Out>value = {String(value)} | modal = {String(modal.isOpen)}</Out>
      {modal.isOpen && (
        <div className="box">
          من یک «مودال» هستم <button onClick={modal.close}>بستن</button>
        </div>
      )}
    </Card>
  )
}

// useCounter(initial, { min, max, step }) → { count, increment, decrement, reset, set }
//   مقدار همیشه بین min و max می‌ماند.
function UseCounterDemo() {
  const { count, increment, decrement, reset, set } = useCounter(5, { min: 0, max: 10, step: 1 })
  return (
    <Card name="useCounter" desc="شمارنده با حداقل/حداکثر و گام (min 0, max 10)">
      <div className="row">
        <button onClick={() => decrement()}>−</button>
        <button onClick={() => increment()}>+</button>
        <button onClick={() => increment(3)}>+3</button>
        <button onClick={() => set(10)}>set(10)</button>
        <button onClick={reset}>reset</button>
      </div>
      <Out>{count}</Out>
    </Card>
  )
}

// useArray(initial) → [array, actions]
//   actions: push, unshift, pop, shift, insert, update, removeAt, remove(predicate), filter, map,
//            move, swap, sort, reverse, clear, reset, set
function UseArrayDemo() {
  const [list, a] = useArray<number>([3, 1, 2])
  return (
    <Card name="useArray" desc="آرایه با متدهای immutable (push/remove/move/sort …)">
      <div className="row">
        <button onClick={() => a.push(Math.floor(Math.random() * 100))}>push</button>
        <button onClick={a.pop}>pop</button>
        <button onClick={() => a.removeAt(0)}>removeAt(0)</button>
        <button onClick={() => a.sort((x, y) => x - y)}>sort</button>
        <button onClick={a.reverse}>reverse</button>
        <button onClick={() => a.update(0, (v) => v + 10)}>update(0)</button>
        <button onClick={() => a.swap(0, list.length - 1)}>swap first/last</button>
        <button onClick={a.reset}>reset</button>
        <button onClick={a.clear}>clear</button>
      </div>
      <Out>[{list.join(', ')}]</Out>
    </Card>
  )
}

// useMap(initialEntries) → [map, { set, setAll, merge, remove, clear, reset }]
function UseMapDemo() {
  const [map, { set, remove, clear, reset }] = useMap<string, number>([['a', 1]])
  return (
    <Card name="useMap" desc="state از نوع Map (هر تغییر → Map جدید)">
      <div className="row">
        <button onClick={() => set('k' + map.size, map.size)}>set</button>
        <button onClick={() => remove('a')}>remove('a')</button>
        <button onClick={reset}>reset</button>
        <button onClick={clear}>clear</button>
      </div>
      <Out>{JSON.stringify([...map])}</Out>
    </Card>
  )
}

// useSet(initialItems) → [set, { add, remove, toggle, has, clear, reset, set }]
function UseSetDemo() {
  const [set, { toggle, clear }] = useSet<number>([1])
  return (
    <Card name="useSet" desc="state از نوع Set؛ مناسب انتخاب‌های چندتایی">
      <div className="row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={'chip' + (set.has(n) ? ' on' : '')} onClick={() => toggle(n)}>
            {n}
          </button>
        ))}
        <button onClick={clear}>clear</button>
      </div>
      <Out>{JSON.stringify([...set])}</Out>
    </Card>
  )
}

// useObjectState(initial) → [state, patch, reset]
//   patch({ age: 3 }) فقط همان فیلد را تغییر می‌دهد (مثل this.setState کلاس‌ها)
function UseObjectStateDemo() {
  const [user, patch, reset] = useObjectState({ name: 'Ali', age: 20 })
  return (
    <Card name="useObjectState" desc="آپدیت جزئی (partial) روی state آبجکتی">
      <div className="row">
        <input value={user.name} onChange={(e) => patch({ name: e.target.value })} />
        <button onClick={() => patch((u) => ({ age: u.age + 1 }))}>age+1</button>
        <button onClick={reset}>reset</button>
      </div>
      <Out>{JSON.stringify(user)}</Out>
    </Card>
  )
}

// useHistoryState(initial, capacity) → { state, set, undo, redo, canUndo, canRedo, clear, reset, past, future }
function UseHistoryStateDemo() {
  const h = useHistoryState('سلام')
  return (
    <Card name="useHistoryState" desc="Undo / Redo برای هر مقداری (ادیتور، نقاشی، فرم …)">
      <input value={h.state} onChange={(e) => h.set(e.target.value)} />
      <div className="row">
        <button disabled={!h.canUndo} onClick={h.undo}>↶ undo</button>
        <button disabled={!h.canRedo} onClick={h.redo}>↷ redo</button>
        <button onClick={h.reset}>reset</button>
        <span className="muted">history: {h.past.length}</span>
      </div>
    </Card>
  )
}

// usePrevious(value) → مقدار رندر قبلی
function UsePreviousDemo() {
  const [n, setN] = useState(0)
  const prev = usePrevious(n)
  return (
    <Card name="usePrevious" desc="مقدار قبلی یک state/prop را برمی‌گرداند">
      <button onClick={() => setN((x) => x + 1)}>n++</button>
      <Out>الان: {n} | قبلی: {String(prev)}</Out>
    </Card>
  )
}

// useDefault(initial, defaultValue) → [value, setValue]   اگر null/undefined باشد defaultValue برمی‌گردد
function UseDefaultDemo() {
  const [name, setName] = useDefault<string | null>(null, 'مهمان')
  return (
    <Card name="useDefault" desc="اگر state خالی (null/undefined) بود مقدار پیش‌فرض می‌دهد">
      <div className="row">
        <input placeholder="اسم…" onChange={(e) => setName(e.target.value || null)} />
      </div>
      <Out>سلام {name}</Out>
    </Card>
  )
}

// useQueue(initial) → { queue, add, remove(first), first, last, size, clear }
function UseQueueDemo() {
  const q = useQueue<number>([1, 2])
  return (
    <Card name="useQueue" desc="صف FIFO">
      <div className="row">
        <button onClick={() => q.add(q.size + 1)}>add</button>
        <button onClick={() => q.remove()}>remove first</button>
        <button onClick={q.clear}>clear</button>
      </div>
      <Out>{JSON.stringify(q.queue)} size={q.size}</Out>
    </Card>
  )
}

// useStep(maxStep) → { step, next, prev, goTo, reset, canNext, canPrev, isFirst, isLast, progress }
function UseStepDemo() {
  const s = useStep(4)
  return (
    <Card name="useStep" desc="ویزارد / stepper چندمرحله‌ای">
      <div className="bar"><i style={{ width: s.progress + '%' }} /></div>
      <div className="row">
        <button disabled={!s.canPrev} onClick={s.prev}>قبلی</button>
        <button disabled={!s.canNext} onClick={s.next}>بعدی</button>
        <button onClick={() => s.goTo(3)}>برو مرحله ۳</button>
        <span>مرحله {s.step} از 4</span>
      </div>
    </Card>
  )
}

// useCycle(list) → { value, index, next, prev, setIndex, setValue }   چرخشی بین مقادیر
function UseCycleDemo() {
  const c = useCycle(['🌞 light', '🌙 dark', '🖥 system'] as const)
  return (
    <Card name="useCycle" desc="چرخیدن بین چند مقدار (حالت تم، سایز، …)">
      <div className="row">
        <button onClick={c.prev}>◀</button>
        <button onClick={c.next}>▶</button>
      </div>
      <Out>{c.value}</Out>
    </Card>
  )
}

// useForceUpdate() → تابعی که کامپوننت را مجبور به رندر مجدد می‌کند
function UseForceUpdateDemo() {
  const update = useForceUpdate()
  return (
    <Card name="useForceUpdate" desc="رندر اجباری (آخرین راه‌حل!)">
      <button onClick={update}>re-render</button>
      <Out>{Date.now()}</Out>
    </Card>
  )
}

// useRenderCount() → تعداد رندرها (در StrictMode dev دو برابر می‌شود)
// useIsFirstRender() → فقط در رندر اول true
function UseRenderCountDemo() {
  const count = useRenderCount()
  const first = useIsFirstRender()
  const force = useForceUpdate()
  return (
    <Card name="useRenderCount / useIsFirstRender" desc="دیباگ: چند بار رندر شد؟ آیا رندر اول است؟">
      <button onClick={force}>re-render</button>
      <Out>renders: {count} | first: {String(first)}</Out>
    </Card>
  )
}

// useControllableState({ value, defaultValue, onChange }) → [state, setState]
//   برای ساخت کامپوننت‌هایی که هم controlled (با value) هم uncontrolled (با defaultValue) کار کنند.
function Switch({ checked, defaultChecked = false, onChange }: { checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void }) {
  const [value, setValue] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange })
  return <button className={'chip' + (value ? ' on' : '')} onClick={() => setValue((v) => !v)}>{value ? 'ON' : 'OFF'}</button>
}
function UseControllableStateDemo() {
  const [ext, setExt] = useState(true)
  return (
    <Card name="useControllableState" desc="کامپوننت هم controlled هم uncontrolled">
      <div className="row">
        <span className="muted">uncontrolled:</span><Switch defaultChecked={false} />
        <span className="muted">controlled:</span><Switch checked={ext} onChange={setExt} />
      </div>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  2) LIFECYCLE – چرخه‌ی عمر و effect ها
 * ════════════════════════════════════════════════════════════════════ */

// useMount(fn)   → فقط یک‌بار بعد از mount     |  useUnmount(fn) → هنگام unmount
function Lifecycle({ log }: { log: (m: string) => void }) {
  useMount(() => log('✅ mounted'))
  useUnmount(() => log('❌ unmounted'))
  return <span className="ok">من زنده‌ام</span>
}
function UseMountDemo() {
  const [show, toggle] = useToggle(true)
  const [logs, setLogs] = useState<string[]>([])
  return (
    <Card name="useMount / useUnmount" desc="اجرا هنگام mount و unmount">
      <button onClick={toggle}>{show ? 'unmount کن' : 'mount کن'}</button>
      {show && <Lifecycle log={(m) => setLogs((l) => [...l.slice(-3), m])} />}
      <Out>{logs.join(' | ') || '—'}</Out>
    </Card>
  )
}

// useUpdateEffect(effect, deps) → مثل useEffect ولی بار اول (mount) اجرا نمی‌شود
function UseUpdateEffectDemo() {
  const [n, setN] = useState(0)
  const [runs, setRuns] = useState(0)
  useUpdateEffect(() => setRuns((r) => r + 1), [n])
  return (
    <Card name="useUpdateEffect" desc="فقط روی آپدیت‌ها اجرا می‌شود، نه mount">
      <button onClick={() => setN(n + 1)}>n = {n}</button>
      <Out>تعداد اجرای effect: {runs}</Out>
    </Card>
  )
}

// useIsMounted() → () => boolean   جلوگیری از setState بعد از unmount
function UseIsMountedDemo() {
  const isMounted = useIsMounted()
  const [text, setText] = useState('—')
  return (
    <Card name="useIsMounted" desc="بعد از await چک کن کامپوننت هنوز هست یا نه">
      <button onClick={async () => { await sleep(800); if (isMounted()) setText('✔ هنوز mount بود') }}>اجرا (۰.۸ ثانیه)</button>
      <Out>{text}</Out>
    </Card>
  )
}

// useDeepCompareEffect / useDeepCompareMemo: وابستگی‌ها را «عمیق» مقایسه می‌کنند،
//   پس آبجکت/آرایه‌ی inline باعث effect اضافه نمی‌شود.
function UseDeepCompareDemo() {
  const [n, setN] = useState(0)
  const [v, setV] = useState(1)
  const [runs, setRuns] = useState(0)
  const filter = { page: 1, v } // هر رندر یک آبجکت جدید!
  useDeepCompareEffect(() => setRuns((r) => r + 1), [filter])
  const memo = useDeepCompareMemo(() => `v=${filter.v}`, [filter])
  return (
    <Card name="useDeepCompareEffect / Memo" desc="مقایسه‌ی عمیق وابستگی‌ها">
      <div className="row">
        <button onClick={() => setN(n + 1)}>re-render ({n})</button>
        <button onClick={() => setV(v + 1)}>تغییر v</button>
      </div>
      <Out>effect اجرا شد: {runs} | memo: {memo}</Out>
    </Card>
  )
}

// useCustomCompareEffect(effect, deps, compare) → مقایسه‌ی دلخواه  (اینجا فقط id مهم است)
// useMemoCompare(next, compare) → تا وقتی compare درست است مقدار قبلی (با همان reference) برمی‌گردد
function UseCustomCompareDemo() {
  const [user, setUser] = useState({ id: 1, name: 'Ali' })
  const [runs, setRuns] = useState(0)
  useCustomCompareEffect(() => setRuns((r) => r + 1), [user], (a, b) => a[0].id === b[0].id)
  const stable = useMemoCompare(user, (p, n) => p?.id === n.id)
  return (
    <Card name="useCustomCompareEffect / useMemoCompare" desc="مقایسه‌ی دلخواه؛ فقط id مهم است">
      <div className="row">
        <button onClick={() => setUser({ ...user, name: user.name + '!' })}>تغییر name</button>
        <button onClick={() => setUser({ id: user.id + 1, name: 'New' })}>تغییر id</button>
      </div>
      <Out>effect: {runs} | stable.name: {stable.name} | user.name: {user.name}</Out>
    </Card>
  )
}

// useAsyncEffect(async (isCancelled) => {...}, deps)   بعد از هر await چک کن isCancelled() نباشد
function UseAsyncEffectDemo() {
  const [id, setId] = useState(1)
  const [data, setData] = useState('…')
  useAsyncEffect(async (cancelled) => {
    setData('loading…')
    await sleep(600)
    if (!cancelled()) setData(`نتیجه‌ی ${id}`)
  }, [id])
  return (
    <Card name="useAsyncEffect" desc="effect با async/await، ایمن در برابر race condition">
      <button onClick={() => setId(id + 1)}>id = {id}</button>
      <Out>{data}</Out>
    </Card>
  )
}

// useWhyDidYouUpdate(name, props) و useLogger(name, ...)  → خروجی در Console مرورگر (F12)
function Debuggee({ a, b }: { a: number; b: object }) {
  useWhyDidYouUpdate('Debuggee', { a, b })
  useLogger('Debuggee', a)
  return <Out>a = {a}</Out>
}
function UseWhyDidYouUpdateDemo() {
  const [a, setA] = useState(0)
  return (
    <Card name="useWhyDidYouUpdate / useLogger" desc="دیباگ: کدام prop باعث رندر شد؟ (Console را ببین)">
      <button onClick={() => setA(a + 1)}>a++</button>
      <Debuggee a={a} b={{}} />
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  3) TIMING – زمان، debounce، تایمر
 * ════════════════════════════════════════════════════════════════════ */

// useDebounce(value, delay) → مقدار با تأخیر   |   useDebouncedState(initial, delay) → [value, debounced, setValue]
function UseDebounceDemo() {
  const [text, setText] = useState('')
  const debounced = useDebounce(text, 500)
  const [v, dv, setV] = useDebouncedState('', 500)
  return (
    <Card name="useDebounce / useDebouncedState" desc="مقدار فقط بعد از ۵۰۰ms سکوت آپدیت می‌شود (سرچ)">
      <input placeholder="تایپ کن…" value={text} onChange={(e) => setText(e.target.value)} />
      <Out>فوری: {text} | debounced: {debounced}</Out>
      <input placeholder="useDebouncedState" value={v} onChange={(e) => setV(e.target.value)} />
      <Out>{dv}</Out>
    </Card>
  )
}

// useDebouncedCallback(fn, delay, { leading, trailing, maxWait }) → تابع debounce شده با .cancel() .flush() .isPending()
function UseDebouncedCallbackDemo() {
  const [log, setLog] = useState('—')
  const search = useDebouncedCallback((q: string) => setLog(`API call → "${q}"`), 600)
  return (
    <Card name="useDebouncedCallback" desc="تابع debounce شده؛ با cancel و flush">
      <input placeholder="تایپ کن…" onChange={(e) => search(e.target.value)} />
      <div className="row">
        <button onClick={search.flush}>flush</button>
        <button onClick={search.cancel}>cancel</button>
      </div>
      <Out>{log}</Out>
    </Card>
  )
}

// useThrottle(value, interval) و useThrottledCallback(fn, interval)  → حداکثر یک‌بار در هر interval
function UseThrottleDemo() {
  const { x } = useMouse()
  const throttledX = useThrottle(x, 500)
  const [count, setCount] = useState(0)
  const click = useThrottledCallback(() => setCount((c) => c + 1), 1000)
  return (
    <Card name="useThrottle / useThrottledCallback" desc="ماوس را حرکت بده؛ دکمه فقط ثانیه‌ای یک‌بار کار می‌کند">
      <Out>mouse x: {x} | throttled: {throttledX}</Out>
      <button onClick={click}>سریع کلیک کن (شمارش: {count})</button>
    </Card>
  )
}

// useTimeout(cb, delay|null) → { clear, reset, isPending }
function UseTimeoutDemo() {
  const [msg, setMsg] = useState('منتظر…')
  const { clear, reset } = useTimeout(() => setMsg('⏰ ۳ ثانیه گذشت!'), 3000)
  return (
    <Card name="useTimeout" desc="setTimeout با clear / reset">
      <div className="row">
        <button onClick={() => { setMsg('منتظر…'); reset() }}>reset</button>
        <button onClick={clear}>clear</button>
      </div>
      <Out>{msg}</Out>
    </Card>
  )
}

// useInterval(cb, delay|null)  →  delay = null یعنی متوقف
function UseIntervalDemo() {
  const [n, setN] = useState(0)
  const [running, toggle] = useToggle(true)
  useInterval(() => setN((x) => x + 1), running ? 1000 : null)
  return (
    <Card name="useInterval" desc="setInterval اعلانی؛ delay=null یعنی pause">
      <button onClick={toggle}>{running ? 'pause' : 'play'}</button>
      <Out>{n}</Out>
    </Card>
  )
}

// useCountdown(from, { interval, autoStart, onComplete }) → { count, isRunning, start, pause, resume, reset }
function UseCountdownDemo() {
  const c = useCountdown(10, { onComplete: () => alert('تمام شد!') })
  return (
    <Card name="useCountdown" desc="شمارش معکوس (OTP، تایمر)">
      <div className="row">
        <button onClick={() => c.start()}>start</button>
        <button onClick={c.pause}>pause</button>
        <button onClick={c.resume}>resume</button>
        <button onClick={c.reset}>reset</button>
      </div>
      <Out>{c.count}s {c.isRunning ? '▶' : '⏸'}</Out>
    </Card>
  )
}

// useStopwatch() → { time(ms), isRunning, start, pause, toggle, reset, lap, laps }
function UseStopwatchDemo() {
  const s = useStopwatch()
  return (
    <Card name="useStopwatch" desc="کرنومتر با lap">
      <div className="row">
        <button onClick={s.toggle}>{s.isRunning ? 'pause' : 'start'}</button>
        <button onClick={s.lap}>lap</button>
        <button onClick={s.reset}>reset</button>
      </div>
      <Out>{formatStopwatch(s.time)} {s.laps.length > 0 && `| laps: ${s.laps.map(formatStopwatch).join(' , ')}`}</Out>
    </Card>
  )
}

// useNow(interval) → Date زنده   |   useRelativeTime(date, { locale }) → «۳ دقیقه پیش»
function UseNowDemo() {
  const now = useNow(1000)
  const [created] = useState(() => Date.now() - 5 * 60 * 1000)
  const fa = useRelativeTime(created, { locale: 'fa', updateInterval: 5000 })
  const en = useRelativeTime(created, { locale: 'en', updateInterval: 5000 })
  return (
    <Card name="useNow / useRelativeTime" desc="ساعت زنده و زمان نسبی">
      <Out>{now.toLocaleTimeString()}</Out>
      <Out>{fa} | {en}</Out>
    </Card>
  )
}

// useAnimationFrame((deltaMs, time) => {...}, enabled)   |   useRafState(initial) → مثل useState ولی هر فریم یک‌بار
function UseAnimationFrameDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const angle = useRef(0)
  const [on, toggle] = useToggle(true)
  const [fps, setFps] = useRafState(0)
  useAnimationFrame((dt) => {
    angle.current += dt * 0.2
    if (ref.current) ref.current.style.transform = `rotate(${angle.current}deg)`
    setFps(Math.round(1000 / Math.max(dt, 1)))
  }, on)
  return (
    <Card name="useAnimationFrame / useRafState" desc="حلقه‌ی انیمیشن با requestAnimationFrame">
      <div ref={ref} style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 8 }} />
      <div className="row"><button onClick={toggle}>{on ? 'stop' : 'start'}</button><span className="muted">fps ≈ {fps}</span></div>
    </Card>
  )
}

// useIdle(timeoutMs) → true وقتی کاربر چیزی لمس/تایپ نکرده (اینجا ۵ ثانیه)
function UseIdleDemo() {
  const idle = useIdle(5000)
  return (
    <Card name="useIdle" desc="کاربر ۵ ثانیه فعالیتی نداشته؟">
      <Out>{idle ? '😴 idle' : '🙂 active'}</Out>
    </Card>
  )
}

// useCountUp(end, { duration, decimals }) → عدد انیمیشنی    |   useTypewriter(text, { speed, loop })
function UseCountUpDemo() {
  const [end, setEnd] = useState(1000)
  const n = useCountUp(end, { duration: 1200 })
  const { displayed, done } = useTypewriter('سلام! این یک متن تایپ‌شونده است…', { speed: 60, loop: true })
  return (
    <Card name="useCountUp / useTypewriter" desc="انیمیشن عدد و تایپ‌رایتر">
      <div className="row"><button onClick={() => setEnd(Math.floor(Math.random() * 10000))}>عدد جدید</button><b>{n.toLocaleString()}</b></div>
      <Out>{displayed}{done ? ' ✔' : '▍'}</Out>
    </Card>
  )
}

// useDelayedLoading(loading, { delay, minDuration }) → جلوگیری از چشمک‌زدن اسپینر
function UseDelayedLoadingDemo() {
  const [loading, setLoading] = useState(false)
  const show = useDelayedLoading(loading, { delay: 300, minDuration: 800 })
  const run = (ms: number) => { setLoading(true); setTimeout(() => setLoading(false), ms) }
  return (
    <Card name="useDelayedLoading" desc="اگر لود کمتر از ۳۰۰ms بود اسپینر نشان نده؛ وگرنه حداقل ۸۰۰ms نگه دار">
      <div className="row"><button onClick={() => run(100)}>لود سریع (۱۰۰ms)</button><button onClick={() => run(1500)}>لود کند (۱.۵s)</button></div>
      <Out>{show ? '⏳ spinner' : 'بدون اسپینر'}</Out>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  4) STORAGE & URL
 * ════════════════════════════════════════════════════════════════════ */

// useLocalStorage(key, initial) → [value, setValue, remove]
//   بین تب‌ها و کامپوننت‌ها sync می‌شود. (دو تب باز کن و تست کن!)
function UseLocalStorageDemo() {
  const [name, setName, remove] = useLocalStorage('demo:name', 'علی')
  const [obj, setObj] = useLocalStorage('demo:obj', { visits: 0 })
  return (
    <Card name="useLocalStorage" desc="ذخیره در localStorage با sync بین تب‌ها">
      <div className="row"><input value={name} onChange={(e) => setName(e.target.value)} /><button onClick={remove}>remove</button></div>
      <div className="row"><button onClick={() => setObj((o) => ({ visits: o.visits + 1 }))}>visits++</button><Out>{JSON.stringify(obj)}</Out></div>
    </Card>
  )
}

// useSessionStorage(key, initial) → مثل بالا ولی با بستن تب پاک می‌شود
function UseSessionStorageDemo() {
  const [draft, setDraft] = useSessionStorage('demo:draft', '')
  return (
    <Card name="useSessionStorage" desc="پیش‌نویس موقت (با بستن تب پاک می‌شود)">
      <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="پیش‌نویس…" />
    </Card>
  )
}

// useCookie(name, default) → [value, set(value, { days, path, secure, sameSite }), remove]
function UseCookieDemo() {
  const [c, setC, removeC] = useCookie('demo_cookie', 'ندارد')
  return (
    <Card name="useCookie" desc="خواندن/نوشتن کوکی (reactive)">
      <div className="row"><button onClick={() => setC('v' + Math.floor(Math.random() * 99), { days: 7 })}>set</button><button onClick={() => removeC()}>remove</button></div>
      <Out>{c}</Out>
    </Card>
  )
}

// useQueryParam(key, default) → [value, set]   |   useQueryParams() → [paramsObject, setParams(patch)]
//   آدرس مرورگر (?tab=…) را با state یکی می‌کند؛ لینک قابل اشتراک.
function UseQueryParamDemo() {
  const [tab, setTab] = useQueryParam('tab', 'home')
  const [params, setParams] = useQueryParams()
  return (
    <Card name="useQueryParam / useQueryParams" desc="state داخل آدرس URL (?tab=…)">
      <div className="row">
        {['home', 'profile', 'settings'].map((t) => (
          <button key={t} className={'chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>
        ))}
        <button onClick={() => setParams({ page: 2, q: 'react' })}>page=2&q=react</button>
        <button onClick={() => setParams({}, { reset: true })}>پاک کردن همه</button>
      </div>
      <Out>{JSON.stringify(params)}</Out>
    </Card>
  )
}

// useHash() → [hash, setHash]     |   location.hash
function UseHashDemo() {
  const [hash, setHash] = useHash()
  return (
    <Card name="useHash" desc="مقدار #hash آدرس">
      <div className="row"><button onClick={() => setHash('section-' + Math.floor(Math.random() * 10))}>تغییر hash</button></div>
      <Out>#{hash}</Out>
    </Card>
  )
}

// useBroadcastChannel(name, onMessage?) → { post, lastMessage }   ارتباط بین تب‌ها (دو تب باز کن)
function UseBroadcastChannelDemo() {
  const { post, lastMessage } = useBroadcastChannel<string>('demo-channel')
  return (
    <Card name="useBroadcastChannel" desc="پیام بین تب‌های هم‌دامنه (دو تب باز کن)">
      <button onClick={() => post('سلام از تب ' + Math.floor(Math.random() * 100))}>ارسال به تب‌های دیگر</button>
      <Out>{lastMessage ?? 'پیامی نیامده'}</Out>
    </Card>
  )
}

// useIndexedDB<T>(dbName, storeName) → { ready, get, set, remove, clear, keys, getAll }  (همه async)
function UseIndexedDBDemo() {
  const db = useIndexedDB<{ text: string }>('hooks-demo', 'notes')
  const [out, setOut] = useState('—')
  return (
    <Card name="useIndexedDB" desc="دیتابیس مرورگر برای داده‌ی حجیم (key-value)">
      <div className="row">
        <button disabled={!db.ready} onClick={async () => { await db.set('n1', { text: 'یادداشت ' + Date.now() }); setOut('ذخیره شد') }}>set</button>
        <button disabled={!db.ready} onClick={async () => setOut(JSON.stringify(await db.get('n1')))}>get</button>
        <button disabled={!db.ready} onClick={async () => { await db.clear(); setOut('پاک شد') }}>clear</button>
      </div>
      <Out>{db.ready ? out : 'در حال باز کردن…'}</Out>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  5) DOM – رویدادها، المنت‌ها، ژست‌ها
 * ════════════════════════════════════════════════════════════════════ */

// useEventListener(type, handler, target?, options?)   target: window (پیش‌فرض) | document | element | ref
function UseEventListenerDemo() {
  const btn = useRef<HTMLButtonElement>(null)
  const [log, setLog] = useState('—')
  useEventListener('click', () => setLog('کلیک روی دکمه'), btn)
  useEventListener('keydown', (e) => setLog(`window keydown: ${e.key}`))
  return (
    <Card name="useEventListener" desc="addEventListener با cleanup خودکار">
      <button ref={btn}>دکمه (ref)</button>
      <Out>{log}</Out>
    </Card>
  )
}

// useWindowSize() → { width, height }   |   useBreakpoint() → { current, isAtLeast('md'), isBelow('lg'), width }
function UseWindowSizeDemo() {
  const { width, height } = useWindowSize()
  const bp = useBreakpoint()
  return (
    <Card name="useWindowSize / useBreakpoint" desc="اندازه‌ی پنجره و breakpoint فعلی (sm 640, md 768, lg 1024 …)">
      <Out>{width} × {height} | breakpoint: {String(bp.current)} | ≥md: {String(bp.isAtLeast('md'))}</Out>
    </Card>
  )
}

// useScroll(target?) → { x, y, directionY, isScrolling, arrived:{top,bottom,…}, scrollTo }
//   بدون آرگومان = اسکرول window ؛ با ref = اسکرول همان المنت
// useScrollIntoView() → تابعی که المنت را با انیمیشن به دید می‌آورد
function UseScrollDemo() {
  const box = useRef<HTMLDivElement>(null)
  const { y, directionY, isScrolling, arrived } = useScroll(box)
  const page = useScroll()
  const scrollTo = useScrollIntoView()
  const bottom = useRef<HTMLDivElement>(null)
  return (
    <Card name="useScroll / useScrollIntoView" desc="موقعیت و جهت اسکرول (داخل باکس پایین اسکرول کن)">
      <div ref={box} style={{ height: 80, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div style={{ height: 300, padding: 8 }}>اسکرول کن ↓<div ref={bottom} style={{ marginTop: 230 }}>🏁 انتهای باکس</div></div>
      </div>
      <button onClick={() => scrollTo(bottom)}>برو به انتها</button>
      <Out>box y: {Math.round(y)} | {directionY ?? '-'} | {isScrolling ? 'scrolling' : 'idle'} | bottom: {String(arrived.bottom)} | page y: {Math.round(page.y)}</Out>
    </Card>
  )
}

// useScrollLock(locked) → اسکرول صفحه را قفل می‌کند (مودال/دراور)
function UseScrollLockDemo() {
  const [locked, toggle] = useToggle(false)
  useScrollLock(locked)
  return (
    <Card name="useScrollLock" desc="قفل اسکرول body (با جبران عرض اسکرول‌بار)">
      <button onClick={toggle}>{locked ? 'باز کردن قفل' : 'قفل کردن اسکرول'}</button>
    </Card>
  )
}

// useScrollSpy(ids, { offset }) → id بخشی که الان در دید است (فهرست مطالب)
function UseScrollSpyDemo() {
  const active = useScrollSpy(['group-state', 'group-timing', 'group-dom', 'group-browser', 'group-network'], { offset: 60 })
  return (
    <Card name="useScrollSpy" desc="کدام بخش صفحه الان دیده می‌شود؟ (اسکرول کن)">
      <Out>{active ?? '—'}</Out>
    </Card>
  )
}

// useOnClickOutside(ref | [refs], handler, { enabled })
function UseOnClickOutsideDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const { isOpen, toggle, close } = useDisclosure()
  useOnClickOutside(ref, close, { enabled: isOpen })
  return (
    <Card name="useOnClickOutside" desc="کلیک بیرون از منو → بسته شود">
      <div ref={ref}>
        <button onClick={toggle}>منو {isOpen ? '▲' : '▼'}</button>
        {isOpen && <div className="box" style={{ marginTop: 6 }}>آیتم ۱ · آیتم ۲ · آیتم ۳</div>}
      </div>
    </Card>
  )
}

// useHover() → [ref, isHovered]  | useFocus() → [ref, isFocused] | useFocusWithin() → [ref, isFocusInside]
//   ref را روی المنت بگذار.
function UseHoverDemo() {
  const [hRef, hovered] = useHover<HTMLDivElement>()
  const [fRef, focused] = useFocus<HTMLInputElement>()
  const [wRef, within] = useFocusWithin<HTMLDivElement>()
  return (
    <Card name="useHover / useFocus / useFocusWithin" desc="وضعیت hover و focus">
      <div ref={hRef} className={'box' + (hovered ? ' active' : '')}>{hovered ? 'hover شده 👆' : 'ماوس را بیاور'}</div>
      <input ref={fRef} placeholder={focused ? 'فوکوس دارد ✔' : 'کلیک کن'} />
      <div ref={wRef} className={'box' + (within ? ' active' : '')}><input placeholder="فیلد ۱" /> <input placeholder="فیلد ۲" /></div>
    </Card>
  )
}

// useKeyPress(key | [keys], handler?, { event, preventDefault, target, enabled }) → boolean (الان فشرده است؟)
function UseKeyPressDemo() {
  const space = useKeyPress('Space')
  const [n, setN] = useState(0)
  useKeyPress(['Enter'], () => setN((x) => x + 1))
  return (
    <Card name="useKeyPress" desc="Space نگه دار / Enter بزن">
      <Out>space: {String(space)} | enter ×{n}</Out>
    </Card>
  )
}

// useHotkeys('mod+k', handler, options)   mod = Cmd در مک / Ctrl در بقیه
//   مثال‌ها: 'ctrl+s'  'shift+/'  'alt+n'  ['mod+z','mod+shift+z']
function UseHotkeysDemo() {
  const [log, setLog] = useState('—')
  useHotkeys('mod+k', () => setLog('⌘/Ctrl + K'), { enableOnFormTags: true })
  useHotkeys(['mod+s', 'alt+s'], (_, combo) => setLog('ذخیره با ' + combo))
  return (
    <Card name="useHotkeys" desc="میانبر صفحه‌کلید: Ctrl/⌘+K ، Ctrl/⌘+S ، Alt+S">
      <Out>{log}</Out>
    </Card>
  )
}

// useKeySequence(['a','b','c'], callback)   مثل Konami code
function UseKeySequenceDemo() {
  const [ok, setOk] = useState(false)
  useKeySequence(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'b', 'a'], () => setOk(true))
  return (
    <Card name="useKeySequence" desc="↑ ↑ ↓ ↓ B A را پشت‌سرهم بزن!">
      <Out>{ok ? '🎉 Konami!' : '…'}</Out>
    </Card>
  )
}

// useLongPress(callback, { delay })  → props که باید روی المنت spread شود
function UseLongPressDemo() {
  const [msg, setMsg] = useState('—')
  const props = useLongPress(() => setMsg('✅ نگه داشتی!'), { delay: 700, onStart: () => setMsg('نگه دار…'), onCancel: () => setMsg('زود رها کردی') })
  return (
    <Card name="useLongPress" desc="۰.۷ ثانیه نگه دار">
      <button {...props}>نگه دار</button>
      <Out>{msg}</Out>
    </Card>
  )
}

// useMouse(target?) → { x, y, pageX, pageY, elementX, elementY, isInside }
function UseMouseDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const m = useMouse(ref)
  return (
    <Card name="useMouse" desc="موقعیت ماوس (کلی و نسبت به یک المنت)">
      <div ref={ref} className={'box' + (m.isInside ? ' active' : '')}>داخل من بیا</div>
      <Out>x:{m.x} y:{m.y} | element: {Math.round(m.elementX)},{Math.round(m.elementY)}</Out>
    </Card>
  )
}

// useResizeObserver(ref, cb) | useElementSize() → [ref, {width,height}] | useMeasure() → [ref, rect]
function UseElementSizeDemo() {
  const [sizeRef, size] = useElementSize<HTMLTextAreaElement>()
  const [mRef, rect] = useMeasure<HTMLDivElement>()
  const ro = useRef<HTMLDivElement>(null)
  const [roLog, setRoLog] = useState('')
  useResizeObserver(ro, (e) => setRoLog(`${Math.round(e.contentRect.width)}px`))
  return (
    <Card name="useElementSize / useMeasure / useResizeObserver" desc="اندازه‌ی textarea را با ماوس تغییر بده">
      <textarea ref={sizeRef} rows={2} defaultValue="گوشه را بکش" style={{ resize: 'both' }} />
      <Out>size: {Math.round(size.width)}×{Math.round(size.height)}</Out>
      <div ref={mRef} className="muted">rect: x={Math.round(rect.x)} y={Math.round(rect.y)} w={Math.round(rect.width)}</div>
      <div ref={ro} className="muted">ResizeObserver عرض: {roLog}</div>
    </Card>
  )
}

// useIntersectionObserver(options) → [ref, entry]   |   useInView(options) → [ref, boolean]
function UseInViewDemo() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.6 })
  const root = useRef<HTMLDivElement>(null)
  return (
    <Card name="useInView / useIntersectionObserver" desc="داخل باکس اسکرول کن تا المنت دیده شود">
      <div ref={root} style={{ height: 70, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div style={{ height: 200 }} />
        <div ref={ref} className={'box' + (inView ? ' active' : '')}>{inView ? 'دیده می‌شوم 👀' : 'پنهان'}</div>
        <div style={{ height: 120 }} />
      </div>
      <Out>inView: {String(inView)}</Out>
    </Card>
  )
}

// useInfiniteScroll(loadMore, { hasMore, loading, root }) → ref  (sentinel را آخر لیست بگذار)
function UseInfiniteScrollDemo() {
  const [items, setItems] = useState(() => Array.from({ length: 8 }, (_, i) => i + 1))
  const [loading, setLoading] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null)
  const sentinel = useInfiniteScroll(
    async () => { setLoading(true); await sleep(500); setItems((l) => [...l, ...Array.from({ length: 6 }, (_, i) => l.length + i + 1)]); setLoading(false) },
    { hasMore: items.length < 40, loading, root: rootEl },
  )
  return (
    <Card name="useInfiniteScroll" desc="با اسکرول، آیتم‌های بیشتر لود می‌شود">
      <div ref={(el) => { root.current = el; setRootEl(el) }} style={{ height: 100, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 6 }}>
        {items.map((i) => <div key={i}>آیتم {i}</div>)}
        <div ref={sentinel} className="muted">{loading ? 'در حال لود…' : items.length >= 40 ? 'پایان' : '↓'}</div>
      </div>
    </Card>
  )
}

// useMutationObserver(ref, callback, options)   تغییرات DOM را می‌بیند
function UseMutationObserverDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)
  const [muts, setMuts] = useState(0)
  useMutationObserver(ref, (r) => setMuts((m) => m + r.length), { childList: true })
  return (
    <Card name="useMutationObserver" desc="تعداد تغییرات DOM یک المنت">
      <button onClick={() => setN(n + 1)}>اضافه کردن فرزند</button>
      <div ref={ref}>{Array.from({ length: n }, (_, i) => <span key={i}>🔹</span>)}</div>
      <Out>mutation records: {muts}</Out>
    </Card>
  )
}

// useDraggable({ initial, bounds, axis }) → { x, y, isDragging, bind, reset }   ( {...bind} را روی المنت بگذار )
function UseDraggableDemo() {
  const d = useDraggable({ bounds: [0, 0, 220, 60] })
  return (
    <Card name="useDraggable" desc="هر المنتی را قابل درگ کن (ماوس/لمس)">
      <div style={{ height: 90, position: 'relative', border: '1px dashed var(--border)', borderRadius: 8 }}>
        <div {...d.bind} style={{ ...d.bind.style, width: 60, height: 30, background: 'var(--accent)', borderRadius: 6, position: 'absolute', color: '#fff', textAlign: 'center' }}>drag</div>
      </div>
      <Out>{Math.round(d.x)}, {Math.round(d.y)} {d.isDragging && '✊'}</Out>
    </Card>
  )
}

// useSwipe(ref, { threshold, onSwipe }) → { direction, isSwiping, distanceX, distanceY }
function UseSwipeDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [last, setLast] = useState('—')
  const s = useSwipe(ref, { onSwipe: (d) => setLast(d) })
  return (
    <Card name="useSwipe" desc="روی کادر بکش (سوایپ)">
      <div ref={ref} className="box" style={{ touchAction: 'none' }}>← بکش →</div>
      <Out>live: {s.direction ?? '-'} | last: {last}</Out>
    </Card>
  )
}

// useDropZone(ref, { accept, multiple, maxSize, onDrop }) → { isOver, files, rejected }
// useFileDialog({ accept, multiple }) → { open, files }
function UseDropZoneDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const { isOver, files, rejected } = useDropZone(ref, { accept: ['image/*', '.pdf'], maxSize: 5 * 1024 * 1024 })
  const dialog = useFileDialog({ accept: 'image/*', multiple: true })
  return (
    <Card name="useDropZone / useFileDialog" desc="فایل را درگ کن یا از دیالوگ انتخاب کن (تصویر/PDF تا ۵MB)">
      <div ref={ref} className={'box' + (isOver ? ' active' : '')}>فایل را اینجا رها کن</div>
      <button onClick={() => dialog.open()}>انتخاب فایل…</button>
      <Out>drop: {files.map((f) => f.name).join(', ') || '-'} | رد شده: {rejected.length} | dialog: {dialog.files.length}</Out>
    </Card>
  )
}

// useVirtualList(list, { itemHeight, height }) → { virtualItems, containerProps, wrapperProps, scrollTo }
function UseVirtualListDemo() {
  const list = useMemo(() => Array.from({ length: 100000 }, (_, i) => `ردیف ${i + 1}`), [])
  const { virtualItems, containerProps, wrapperProps, scrollTo } = useVirtualList(list, { itemHeight: 28, height: 120 })
  return (
    <Card name="useVirtualList" desc="۱۰۰٬۰۰۰ ردیف؛ فقط ردیف‌های قابل‌مشاهده رندر می‌شوند">
      <div {...containerProps} style={{ ...containerProps.style, border: '1px solid var(--border)', borderRadius: 8 }}>
        <div {...wrapperProps}>
          {virtualItems.map(({ data, index }) => <div key={index} style={{ height: 28, padding: '0 8px' }}>{data}</div>)}
        </div>
      </div>
      <button onClick={() => scrollTo(50000)}>برو به ردیف ۵۰٬۰۰۰</button>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  6) BROWSER APIs
 * ════════════════════════════════════════════════════════════════════ */

// useMediaQuery(query) → boolean     |  میان‌بُرها: usePrefersReducedMotion, useIsTouchDevice
// useColorScheme() → 'light' | 'dark'  (تم سیستم‌عامل)
function UseMediaQueryDemo() {
  const wide = useMediaQuery('(min-width: 900px)')
  const reduced = usePrefersReducedMotion()
  const touch = useIsTouchDevice()
  const scheme = useColorScheme()
  return (
    <Card name="useMediaQuery (+ میان‌بُرها)" desc="media query به‌صورت reactive">
      <Out>≥900px: {String(wide)} | reduced-motion: {String(reduced)} | touch: {String(touch)} | OS: {scheme}</Out>
    </Card>
  )
}

// useDarkMode({ storageKey, defaultMode }) → { mode, resolved, isDark, setMode, toggle }
//   mode: 'light' | 'dark' | 'system' ؛ در localStorage ذخیره و روی <html> اعمال می‌شود (data-theme + class)
//   (دکمه‌ی تم بالای صفحه از همین هوک استفاده می‌کند)
function UseDarkModeDemo({ dark }: { dark: ReturnType<typeof useDarkMode> }) {
  return (
    <Card name="useDarkMode" desc="تم روشن/تیره/سیستم با ذخیره‌سازی">
      <div className="row">
        {(['light', 'dark', 'system'] as const).map((m) => (
          <button key={m} className={'chip' + (dark.mode === m ? ' on' : '')} onClick={() => dark.setMode(m)}>{m}</button>
        ))}
      </div>
    </Card>
  )
}

// useDocumentTitle(title) | useFavicon(href) | usePageVisibility() | useWindowFocus() | useIsClient()
function UseDocumentTitleDemo() {
  const [n, setN] = useState(0)
  useDocumentTitle(`(${n}) React Hooks Kit`)
  const [fav, toggleFav] = useToggle(false)
  useFavicon(fav ? 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><circle cx=%225%22 cy=%225%22 r=%224%22 fill=%22red%22/></svg>' : 'data:,')
  const vis = usePageVisibility()
  const focus = useWindowFocus()
  const client = useIsClient()
  return (
    <Card name="useDocumentTitle / useFavicon / usePageVisibility / useWindowFocus / useIsClient" desc="عنوان تب، favicon، دیده‌شدن تب، فوکوس پنجره">
      <div className="row"><button onClick={() => setN(n + 1)}>عنوان تب (n={n})</button><button onClick={toggleFav}>favicon</button></div>
      <Out>visibility: {vis} | focus: {String(focus)} | client: {String(client)}</Out>
    </Card>
  )
}

// useBeforeUnload(enabled) → وقتی true است هنگام بستن/رفرش تب هشدار «تغییرات ذخیره نشده» نشان می‌دهد
function UseBeforeUnloadDemo() {
  const [dirty, toggle] = useToggle(false)
  useBeforeUnload(dirty)
  return (
    <Card name="useBeforeUnload" desc="هشدار هنگام ترک صفحه با تغییرات ذخیره‌نشده">
      <label><input type="checkbox" checked={dirty} onChange={toggle} /> تغییرات ذخیره نشده دارم</label>
    </Card>
  )
}

// usePreferredLanguages() → ['fa-IR','en-US',…]
function UseLanguagesDemo() {
  const langs = usePreferredLanguages()
  return (
    <Card name="usePreferredLanguages" desc="زبان‌های ترجیحی مرورگر">
      <Out>{langs.join(', ')}</Out>
    </Card>
  )
}

// useClipboard({ timeout }) → { copy, paste, copied, text, error, isSupported }
function UseClipboardDemo() {
  const { copy, copied, paste, text } = useClipboard({ timeout: 1500 })
  return (
    <Card name="useClipboard" desc="کپی/پیست متن">
      <div className="row">
        <button onClick={() => copy('سلام از useClipboard')}>{copied ? '✔ کپی شد' : 'کپی'}</button>
        <button onClick={paste}>paste</button>
      </div>
      <Out>{text || '—'}</Out>
    </Card>
  )
}

// useFullscreen(ref?) → { isFullscreen, enter, exit, toggle, isSupported }
function UseFullscreenDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const f = useFullscreen(ref)
  return (
    <Card name="useFullscreen" desc="تمام‌صفحه کردن یک المنت">
      <div ref={ref} className="box" style={{ background: 'var(--panel)' }}>من {f.isFullscreen ? 'تمام‌صفحه‌ام' : 'عادی‌ام'}</div>
      <button disabled={!f.isSupported} onClick={f.toggle}>toggle fullscreen</button>
    </Card>
  )
}

// useGeolocation({ enabled, watch, enableHighAccuracy }) → { coords, loading, error, timestamp }
//   تا enabled نشود درخواست مجوز نمی‌دهد.
function UseGeolocationDemo() {
  const [on, toggle] = useToggle(false)
  const g = useGeolocation({ enabled: on })
  return (
    <Card name="useGeolocation" desc="موقعیت مکانی (نیاز به مجوز کاربر)">
      <button onClick={toggle}>{on ? 'غیرفعال' : 'دریافت موقعیت'}</button>
      <Out>{!on ? '—' : g.loading ? 'loading…' : g.error ? g.error.message : `${g.coords?.latitude.toFixed(4)}, ${g.coords?.longitude.toFixed(4)}`}</Out>
    </Card>
  )
}

// useBattery() → { isSupported, level(0..1), charging, chargingTime, dischargingTime }  (فقط Chromium)
function UseBatteryDemo() {
  const b = useBattery()
  return (
    <Card name="useBattery" desc="وضعیت باتری (Chrome/Edge)">
      <Out>{b.isSupported ? `${Math.round(b.level * 100)}% ${b.charging ? '⚡' : ''}` : 'پشتیبانی نمی‌شود'}</Out>
    </Card>
  )
}

// useDeviceOrientation() / useDeviceMotion() / useScreenOrientation()   سنسورهای موبایل
//   در iOS باید requestPermission() را داخل یک کلیک صدا بزنی.
function UseSensorsDemo() {
  const o = useDeviceOrientation()
  const m = useDeviceMotion()
  const s = useScreenOrientation()
  return (
    <Card name="useDeviceOrientation / useDeviceMotion / useScreenOrientation" desc="ژیروسکوپ، شتاب‌سنج و جهت صفحه (موبایل)">
      <button onClick={o.requestPermission}>درخواست مجوز (iOS)</button>
      <Out>β {o.beta?.toFixed(0) ?? '-'} γ {o.gamma?.toFixed(0) ?? '-'} | accel.x {m.acceleration?.x?.toFixed(1) ?? '-'} | {s.type} {s.angle}°</Out>
    </Card>
  )
}

// useSpeechSynthesis() → { speak(text,{lang,rate,pitch}), cancel, pause, resume, speaking, voices }
// useSpeechRecognition({ lang }) → { start, stop, reset, transcript, interim, listening, error }
function UseSpeechDemo() {
  const tts = useSpeechSynthesis()
  const stt = useSpeechRecognition({ lang: 'en-US' })
  return (
    <Card name="useSpeechSynthesis / useSpeechRecognition" desc="تبدیل متن به گفتار و گفتار به متن">
      <div className="row">
        <button disabled={!tts.isSupported} onClick={() => tts.speak('Hello from React hooks', { lang: 'en-US' })}>🔊 speak</button>
        <button disabled={!stt.isSupported} onClick={stt.listening ? stt.stop : stt.start}>{stt.listening ? '⏹ stop' : '🎤 listen'}</button>
      </div>
      <Out>{stt.transcript} <i className="muted">{stt.interim}</i> {stt.error && <span className="bad">{stt.error}</span>}</Out>
    </Card>
  )
}

// useNotification() → { permission, request, notify(title, options), isSupported }
// useShare() → { share({title,text,url}), isSupported }    useVibrate() → { vibrate(pattern), stop }
function UseNotificationDemo() {
  const n = useNotification()
  const share = useShare()
  const vib = useVibrate()
  return (
    <Card name="useNotification / useShare / useVibrate" desc="نوتیفیکیشن مرورگر، اشتراک‌گذاری بومی، لرزش">
      <div className="row">
        <button onClick={n.request}>مجوز نوتیف ({n.permission})</button>
        <button onClick={() => n.notify('سلام!', { body: 'از useNotification' })}>notify</button>
        <button disabled={!share.isSupported} onClick={() => share.share({ title: 'Hooks', url: location.href })}>share</button>
        <button disabled={!vib.isSupported} onClick={() => vib.vibrate([100, 50, 100])}>vibrate</button>
      </div>
    </Card>
  )
}

// usePermission('geolocation' | 'notifications' | 'camera' …) → 'granted' | 'denied' | 'prompt' | 'unsupported'
// useWakeLock() → { request, release, active }   |   useEyeDropper() → { open() → '#rrggbb' }
function UsePermissionDemo() {
  const perm = usePermission('geolocation')
  const wake = useWakeLock()
  const eye = useEyeDropper()
  const [color, setColor] = useState('')
  return (
    <Card name="usePermission / useWakeLock / useEyeDropper" desc="وضعیت مجوز، بیدار نگه‌داشتن صفحه، قطره‌چکان رنگ">
      <div className="row">
        <button disabled={!wake.isSupported} onClick={wake.active ? wake.release : wake.request}>{wake.active ? 'release wake' : 'keep awake'}</button>
        <button disabled={!eye.isSupported} onClick={async () => setColor((await eye.open()) ?? '')}>🎨 eyedropper</button>
      </div>
      <Out>geolocation: {perm} | <span style={{ color }}>{color || '—'}</span></Out>
    </Card>
  )
}

// useTextSelection() → { text, rect }   متن انتخاب‌شده‌ی صفحه
function UseTextSelectionDemo() {
  const { text } = useTextSelection()
  return (
    <Card name="useTextSelection" desc="هر متنی در صفحه انتخاب کن">
      <Out>{text || '—'}</Out>
    </Card>
  )
}

// useUserMedia({ video, audio }) → { stream, start, stop, error, isActive }  | useMediaDevices() → { cameras, microphones, speakers }
//   stream را به video.srcObject بده.
function UseUserMediaDemo() {
  const cam = useUserMedia({ video: true })
  const devs = useMediaDevices()
  const ref = useRef<HTMLVideoElement>(null)
  useIsomorphicLayoutEffect(() => { if (ref.current) ref.current.srcObject = cam.stream }, [cam.stream])
  return (
    <Card name="useUserMedia / useMediaDevices" desc="دوربین/میکروفون (نیاز به مجوز)">
      <div className="row"><button onClick={cam.isActive ? cam.stop : cam.start}>{cam.isActive ? 'خاموش' : 'روشن کردن دوربین'}</button></div>
      <video ref={ref} autoPlay muted playsInline style={{ width: '100%', maxHeight: 120, borderRadius: 8, display: cam.isActive ? 'block' : 'none' }} />
      <Out>cameras: {devs.cameras.length} | mics: {devs.microphones.length} {cam.error && <span className="bad">{cam.error.name}</span>}</Out>
    </Card>
  )
}

// useMediaControls(ref) → کنترل کامل <audio>/<video>: { playing, currentTime, duration, volume, muted, play, pause, toggle, seek, setVolume, setMuted, setRate }
// useAudio(src) → همان کنترل‌ها بدون نیاز به تگ <audio>
function UseMediaControlsDemo() {
  const ref = useRef<HTMLAudioElement>(null)
  const m = useMediaControls(ref)
  const a = useAudio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
  return (
    <Card name="useMediaControls / useAudio" desc="کنترل پخش‌کننده‌ی صوت/تصویر">
      <audio ref={ref} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" loop />
      <div className="row"><button onClick={m.toggle}>{m.playing ? '⏸' : '▶'}</button><button onClick={() => m.setVolume(0.5)}>vol .5</button><button onClick={a.toggle}>useAudio toggle</button></div>
      <Out>{m.currentTime.toFixed(1)} / {m.duration.toFixed(1)}s | playing: {String(m.playing)} | useAudio: {String(a.playing)}</Out>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  7) NETWORK & ASYNC
 * ════════════════════════════════════════════════════════════════════ */

// useAsync(fn, { immediate, deps, retries, onSuccess, onError }) → { data, error, status, loading, execute, reset }
function UseAsyncDemo() {
  const [id, setId] = useState(1)
  const user = useAsync(async () => { await sleep(700); if (id % 4 === 0) throw new Error('خطای ساختگی'); return { id, name: 'کاربر ' + id } }, { deps: [id] })
  const save = useAsync(async (name: string) => { await sleep(600); return 'ذخیره شد: ' + name }, { immediate: false })
  return (
    <Card name="useAsync" desc="اجرای async با loading/error؛ immediate:false = دستی با execute">
      <div className="row"><button onClick={() => setId(id + 1)}>id = {id} (۴ خطا می‌دهد)</button><button onClick={() => save.execute('علی')}>save</button></div>
      <Out>{user.loading ? 'loading…' : user.error ? <span className="bad">{user.error.message}</span> : JSON.stringify(user.data)}</Out>
      <Out>{save.loading ? 'saving…' : save.data ?? '—'}</Out>
    </Card>
  )
}

// useFetch<T>(url, { enabled, cacheTime, refetchInterval, retries, method, body, headers, parse }) → { data, loading, error, refetch, abort, mutate }
//   body آبجکت باشد خودکار JSON می‌شود. با تغییر url درخواست قبلی abort می‌شود.
function UseFetchDemo() {
  const [id, setId] = useState(1)
  const { data, loading, error, refetch } = useFetch<{ title: string; completed: boolean }>(`https://jsonplaceholder.typicode.com/todos/${id}`, { cacheTime: 30000, retries: 1 })
  return (
    <Card name="useFetch" desc="درخواست HTTP با abort، cache ۳۰ثانیه و retry (jsonplaceholder)">
      <div className="row"><button onClick={() => setId(id + 1)}>todo #{id}</button><button onClick={refetch}>refetch</button></div>
      <Out>{loading ? 'loading…' : error ? <span className="bad">{error.message}</span> : data?.title}</Out>
    </Card>
  )
}

// useMutation(fn, { onSuccess, onError, onSettled }) → { mutate, mutateAsync, isPending, isSuccess, data, error, reset }   برای POST/PUT/DELETE
function UseMutationDemo() {
  const m = useMutation(async (title: string) => { await sleep(700); return { id: 101, title } }, { onSuccess: (d) => console.log('created', d) })
  return (
    <Card name="useMutation" desc="عملیات نوشتن؛ فقط با mutate اجرا می‌شود">
      <button disabled={m.isPending} onClick={() => m.mutate('کار جدید')}>{m.isPending ? 'در حال ارسال…' : 'ایجاد'}</button>
      <Out>{m.isSuccess ? JSON.stringify(m.data) : '—'}</Out>
    </Card>
  )
}

// usePolling(fn, interval, { stopWhen, enabled }) → { data, isPolling, start, stop, pollNow }
function UsePollingDemo() {
  const counter = useRef(0)
  const p = usePolling(async () => ++counter.current, 1000, { stopWhen: (n) => n >= 5 })
  return (
    <Card name="usePolling" desc="هر ثانیه صدا می‌زند تا شرط توقف (۵) برقرار شود">
      <div className="row"><button onClick={p.start}>start</button><button onClick={p.stop}>stop</button></div>
      <Out>{p.data ?? '—'} {p.isPolling ? '⟳' : '■'}</Out>
    </Card>
  )
}

// useNetwork() → { online, effectiveType, downlink, rtt, saveData, since }
function UseNetworkDemo() {
  const n = useNetwork()
  return (
    <Card name="useNetwork / useOnline" desc="آنلاین/آفلاین و کیفیت اتصال (DevTools → Offline)">
      <Out>{n.online ? '🟢 online' : '🔴 offline'} | {n.effectiveType ?? '?'} | {n.downlink ?? '?'}Mbps</Out>
    </Card>
  )
}

// useWebSocket<T>(url, { reconnect, heartbeat, onMessage, enabled }) → { status, data, history, send, connect, disconnect }
function UseWebSocketDemo() {
  const [on, toggle] = useToggle(false)
  const ws = useWebSocket<string>('wss://echo.websocket.org', { enabled: on, reconnect: false })
  return (
    <Card name="useWebSocket" desc="WebSocket با reconnect و heartbeat (سرور echo)">
      <div className="row"><button onClick={toggle}>{on ? 'قطع' : 'اتصال'}</button><button disabled={ws.status !== 'open'} onClick={() => ws.send('سلام ' + Date.now())}>send</button></div>
      <Out>{ws.status} | آخرین: {String(ws.data ?? '-')}</Out>
    </Card>
  )
}

// useEventSource(url, { events, enabled }) → { data, status, error, close }     (Server-Sent Events)
//   سرور SSE لازم است؛ نمونه‌ی استفاده (کامنت شده چون آدرس عمومی ندارد):
//   const { data, status } = useEventSource<{ price: number }>('/api/stream', { events: ['tick'] })
function UseEventSourceDemo() {
  const es = useEventSource('/api/sse-not-available', { enabled: false })
  return (
    <Card name="useEventSource" desc="Server-Sent Events – نیاز به endpoint سرور (در کد کامنت نمونه هست)">
      <Out>status: {es.status}</Out>
    </Card>
  )
}

// useScript(src, { async, defer, removeOnUnmount }) → 'idle' | 'loading' | 'ready' | 'error'
// useImage(src) → { status, image }
function UseScriptDemo() {
  const status = useScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js')
  const img = useImage('https://picsum.photos/seed/hooks/80/50')
  return (
    <Card name="useScript / useImage" desc="لود اسکریپت خارجی (فقط یک‌بار) و پیش‌لود تصویر">
      <Out>script: {status} | image: {img.status}</Out>
      {img.image && <img src={img.image.src} alt="" style={{ borderRadius: 6, width: 80 }} />}
    </Card>
  )
}

// useWebWorker(pureFn, { timeout }) → { run(...args) → Promise, terminate, status }
//   تابع باید «خالص» باشد (به متغیرهای بیرون از خودش دسترسی ندارد) چون در Worker اجرا می‌شود.
function UseWebWorkerDemo() {
  const { run, status } = useWebWorker((n: number) => { let s = 0; for (let i = 0; i < n; i++) s += i; return s })
  const [res, setRes] = useState<number | null>(null)
  return (
    <Card name="useWebWorker" desc="محاسبه‌ی سنگین بدون فریز شدن UI">
      <button onClick={async () => setRes(await run(500_000_000))}>جمع ۵۰۰ میلیون عدد</button>
      <Out>{status} | {res ?? '—'}</Out>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  8) FORMS & DATA LISTS
 * ════════════════════════════════════════════════════════════════════ */

// useForm({ initialValues, validators | validate, onSubmit, validateOn }) → { values, errors, touched, dirty, isValid, isSubmitting,
//   handleSubmit, getFieldProps(name), setValue, setValues, setFieldError, reset, validate }
function UseFormDemo() {
  const [done, setDone] = useState('')
  const f = useForm({
    initialValues: { email: '', age: 18, agree: false },
    validators: {
      email: (v) => !/^\S+@\S+\.\S+$/.test(v) && 'ایمیل نامعتبر است',
      age: (v) => v < 18 && 'حداقل ۱۸ سال',
      agree: (v) => !v && 'باید بپذیری',
    },
    onSubmit: async (v, { reset }) => { await sleep(600); setDone(JSON.stringify(v)); reset() },
  })
  return (
    <Card name="useForm" desc="فرم کامل: مقدار، خطا، touched، submit">
      <form onSubmit={f.handleSubmit} style={{ display: 'grid', gap: 6 }}>
        <input placeholder="email" {...f.getFieldProps('email')} />
        {f.touched.email && f.errors.email && <span className="bad">{f.errors.email}</span>}
        <input type="number" {...f.getFieldProps('age')} />
        {f.touched.age && f.errors.age && <span className="bad">{f.errors.age}</span>}
        <label><input type="checkbox" {...f.getFieldProps('agree', { type: 'checkbox' })} /> قوانین را می‌پذیرم</label>
        {f.touched.agree && f.errors.agree && <span className="bad">{f.errors.agree}</span>}
        <div className="row"><button disabled={f.isSubmitting}>{f.isSubmitting ? '…' : 'ارسال'}</button><button type="button" onClick={() => f.reset()}>reset</button><span className="muted">dirty: {String(f.dirty)}</span></div>
      </form>
      <Out>{done || '—'}</Out>
    </Card>
  )
}

// useInput(initial, { transform, validate }) → { value, onChange, bind, error, isValid, touched, reset }
function UseInputDemo() {
  const code = useInput('', { transform: (v) => v.toUpperCase().slice(0, 6), validate: (v) => v.length < 6 && 'باید ۶ حرف باشد' })
  return (
    <Card name="useInput" desc="state یک input با transform (UPPERCASE) و validate">
      <input placeholder="کد ۶ حرفی" {...code.bind} />
      <Out>{code.touched && code.error ? <span className="bad">{code.error}</span> : code.isValid ? <span className="ok">✔</span> : '—'}</Out>
    </Card>
  )
}

// useSelection(items, { getKey, multiple }) → { selected, isSelected, toggle, toggleAll, selectAll, clear, isAllSelected, isPartiallySelected }
function UseSelectionDemo() {
  const items = useMemo(() => [{ id: 1, n: 'الف' }, { id: 2, n: 'ب' }, { id: 3, n: 'ج' }], [])
  const s = useSelection(items, { getKey: (i) => i.id })
  return (
    <Card name="useSelection" desc="انتخاب ردیف‌ها (چک‌باکس جدول)">
      <label><input type="checkbox" checked={s.isAllSelected} ref={(el) => { if (el) el.indeterminate = s.isPartiallySelected }} onChange={s.toggleAll} /> همه</label>
      {items.map((i) => <label key={i.id}><input type="checkbox" checked={s.isSelected(i)} onChange={() => s.toggle(i)} /> {i.n}</label>)}
      <Out>{s.count} انتخاب شده</Out>
    </Card>
  )
}

// usePagination({ total, pageSize, siblings }) → { page, pageCount, pages (با 'dots'), setPage, next, prev, first, last, startIndex, endIndex, setPageSize }
function UsePaginationDemo() {
  const p = usePagination({ total: 237, pageSize: 10 })
  return (
    <Card name="usePagination" desc="صفحه‌بندی با شماره‌ها و «…»">
      <div className="row">
        <button disabled={p.isFirst} onClick={p.prev}>‹</button>
        {p.pages.map((x, i) => x === 'dots' ? <span key={i}>…</span> : <button key={i} className={'chip' + (x === p.page ? ' on' : '')} onClick={() => p.setPage(x)}>{x}</button>)}
        <button disabled={p.isLast} onClick={p.next}>›</button>
      </div>
      <Out>آیتم‌های {p.startIndex + 1} تا {p.endIndex}</Out>
    </Card>
  )
}

// useSort(items, { key, direction }) → { sorted, sortKey, direction, toggleSort(key), setSort }
// useSearch(items, { keys, debounce }) → { query, setQuery, results, isSearching }
const PEOPLE = [
  { name: 'Sara', age: 31, city: 'Tehran' }, { name: 'Ali', age: 25, city: 'Shiraz' },
  { name: 'Reza', age: 40, city: 'Tabriz' }, { name: 'Neda', age: 28, city: 'Tehran' },
]
function UseSortSearchDemo() {
  const { query, setQuery, results } = useSearch(PEOPLE, { keys: ['name', 'city'], debounce: 200 })
  const { sorted, sortKey, direction, toggleSort } = useSort(results, { key: 'name' })
  return (
    <Card name="useSort / useSearch" desc="جست‌وجو (name/city) و مرتب‌سازی با کلیک روی عنوان ستون">
      <input placeholder="search…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <table style={{ width: '100%', fontSize: 13 }}>
        <thead><tr>{(['name', 'age', 'city'] as const).map((k) => <th key={k} style={{ cursor: 'pointer' }} onClick={() => toggleSort(k)}>{k}{sortKey === k ? (direction === 'asc' ? ' ▲' : ' ▼') : ''}</th>)}</tr></thead>
        <tbody>{sorted.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.age}</td><td>{r.city}</td></tr>)}</tbody>
      </table>
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  9) UTILS
 * ════════════════════════════════════════════════════════════════════ */

// useLatest(value) → ref که همیشه آخرین مقدار را دارد (برای timer/listener بدون stale closure)
// useEventCallback(fn) → تابعی با identity ثابت که همیشه آخرین fn را صدا می‌زند
// useConst(() => init) → فقط یک‌بار محاسبه می‌شود
function UseLatestDemo() {
  const [n, setN] = useState(0)
  const latest = useLatest(n)
  const stable = useEventCallback(() => alert('n الان = ' + n))
  const id = useConst(() => Math.random().toString(36).slice(2, 7))
  return (
    <Card name="useLatest / useEventCallback / useConst" desc="ref آخرین مقدار، callback پایدار، مقدار ثابت">
      <div className="row"><button onClick={() => setN(n + 1)}>n = {n}</button><button onClick={() => setTimeout(() => alert('latest.current = ' + latest.current), 1500)}>۱.۵s بعد نشان بده</button><button onClick={stable}>stable()</button></div>
      <Out>const id: {id}</Out>
    </Card>
  )
}

// useMergeRefs(ref1, ref2, …) → یک callback ref (وقتی دو ref روی یک المنت لازم است)
function UseMergeRefsDemo() {
  const a = useRef<HTMLInputElement>(null)
  const [hRef, hovered] = useHover<HTMLInputElement>()
  const merged = useMergeRefs(a, hRef)
  return (
    <Card name="useMergeRefs" desc="چند ref روی یک المنت">
      <input ref={merged} placeholder={hovered ? 'hover ✔' : 'ماوس بیاور'} />
      <button onClick={() => a.current?.focus()}>focus</button>
    </Card>
  )
}

// useLockFn(asyncFn) → { run, locked }   تا تمام نشده، اجرای دوباره نادیده گرفته می‌شود (ضد double-submit)
// useAbortController() → { getSignal, abort }   هر getSignal قبلی را abort می‌کند
function UseLockFnDemo() {
  const [count, setCount] = useState(0)
  const { run, locked } = useLockFn(async () => { await sleep(1000); setCount((c) => c + 1) })
  const { getSignal, abort } = useAbortController()
  return (
    <Card name="useLockFn / useAbortController" desc="چند بار سریع کلیک کن؛ فقط یکی اجرا می‌شود">
      <div className="row"><button disabled={locked} onClick={() => run()}>ارسال (executed: {count})</button><button onClick={() => { const s = getSignal(); s.addEventListener('abort', () => console.log('aborted!')) }}>getSignal</button><button onClick={() => abort()}>abort</button></div>
    </Card>
  )
}

// createStore(initial) + useStore(store, selector)   → استیت سراسری مثل zustand (بدون Provider)
const counterStore = createStore({ count: 0, label: 'global' })
function UseStoreDemo() {
  const count = useStore(counterStore, (s) => s.count)
  return (
    <Card name="createStore / useStore" desc="استیت سراسری ساده (بیرون از React هم کار می‌کند)">
      <div className="row"><button onClick={() => counterStore.setState((s) => ({ count: s.count + 1 }))}>count++</button><button onClick={() => counterStore.reset()}>reset</button></div>
      <Out>{count}</Out>
    </Card>
  )
}

// useEmitter<Events>() → { on, off, emit }   |   useEmitterEvent(emitter, 'event', handler)
//   event bus تایپ‌دار برای ارتباط بین کامپوننت‌های غیرمرتبط. برای bus سراسری از createEmitter استفاده کن.
function UseEmitterDemo() {
  const bus = useEmitter<{ hello: string }>()
  const [msg, setMsg] = useState('—')
  useEmitterEvent(bus, 'hello', setMsg)
  return (
    <Card name="useEmitter / useEmitterEvent" desc="event bus تایپ‌دار">
      <button onClick={() => bus.emit('hello', 'سلام ' + Math.floor(Math.random() * 100))}>emit</button>
      <Out>{msg}</Out>
    </Card>
  )
}

// useStateMachine({ initial, states }) → { state, send(event), can(event), reset }
function UseStateMachineDemo() {
  const m = useStateMachine<'idle' | 'loading' | 'done', 'FETCH' | 'OK' | 'RESET'>({
    initial: 'idle',
    states: { idle: { on: { FETCH: 'loading' } }, loading: { on: { OK: 'done' } }, done: { on: { RESET: 'idle' } } },
  })
  return (
    <Card name="useStateMachine" desc="ماشین حالت: idle → loading → done">
      <div className="row">{(['FETCH', 'OK', 'RESET'] as const).map((e) => <button key={e} disabled={!m.can(e)} onClick={() => m.send(e)}>{e}</button>)}</div>
      <Out>state: {m.state}</Out>
    </Card>
  )
}

// useToasts({ duration, max }) → { toasts, add(message,{type,duration}), remove, clear }   (توست‌های پایین چپ همین صفحه از همین هوک‌اند)
function UseToastsDemo({ t }: { t: ReturnType<typeof useToasts> }) {
  return (
    <Card name="useToasts" desc="صف اعلان‌ها با حذف خودکار">
      <div className="row">
        <button onClick={() => t.add('پیام معمولی')}>info</button>
        <button onClick={() => t.add('ذخیره شد', { type: 'success' })}>success</button>
        <button onClick={() => t.add('خطا رخ داد', { type: 'error', duration: 5000 })}>error</button>
      </div>
    </Card>
  )
}

// useCssVariable('--name', initial) → [value, set]   متغیر CSS را ریاکتی کن
function UseCssVariableDemo() {
  const [accent, setAccent] = useCssVariable('--accent', '#7c8cff')
  return (
    <Card name="useCssVariable" desc="رنگ اصلی (--accent) را عوض کن">
      <input type="color" value={accent.length === 7 ? accent : '#7c8cff'} onChange={(e) => setAccent(e.target.value)} />
    </Card>
  )
}

/* ════════════════════════════════════════════════════════════════════
 *  App – فهرست همه‌ی دموها + جست‌وجو + تم + توست
 * ════════════════════════════════════════════════════════════════════ */

const GROUPS = [
  { id: 'state', title: '۱) State' },
  { id: 'lifecycle', title: '۲) Lifecycle' },
  { id: 'timing', title: '۳) Timing' },
  { id: 'storage', title: '۴) Storage & URL' },
  { id: 'dom', title: '۵) DOM / Events / Gestures' },
  { id: 'browser', title: '۶) Browser APIs' },
  { id: 'network', title: '۷) Network & Async' },
  { id: 'forms', title: '۸) Forms & Lists' },
  { id: 'utils', title: '۹) Utils' },
] as const

export default function App() {
  // تم (روشن/تیره/سیستم) – useDarkMode
  const dark = useDarkMode()
  // توست‌های سراسری – useToasts
  const toasts = useToasts({ duration: 2500 })
  // جست‌وجوی بین دموها – useSearch + میان‌بر Ctrl/⌘+/ برای فوکوس – useHotkeys
  const searchRef = useRef<HTMLInputElement>(null)
  useHotkeys('mod+/', () => searchRef.current?.focus(), { enableOnFormTags: true })
  const [group, setGroup] = useState<string>('all')

  const demos = useMemo(() => [
    { group: 'state', name: 'useToggle', node: <UseToggleDemo /> },
    { group: 'state', name: 'useBoolean useDisclosure', node: <UseBooleanDemo /> },
    { group: 'state', name: 'useCounter', node: <UseCounterDemo /> },
    { group: 'state', name: 'useArray', node: <UseArrayDemo /> },
    { group: 'state', name: 'useMap', node: <UseMapDemo /> },
    { group: 'state', name: 'useSet', node: <UseSetDemo /> },
    { group: 'state', name: 'useObjectState', node: <UseObjectStateDemo /> },
    { group: 'state', name: 'useHistoryState undo redo', node: <UseHistoryStateDemo /> },
    { group: 'state', name: 'usePrevious', node: <UsePreviousDemo /> },
    { group: 'state', name: 'useDefault', node: <UseDefaultDemo /> },
    { group: 'state', name: 'useQueue', node: <UseQueueDemo /> },
    { group: 'state', name: 'useStep wizard', node: <UseStepDemo /> },
    { group: 'state', name: 'useCycle', node: <UseCycleDemo /> },
    { group: 'state', name: 'useForceUpdate', node: <UseForceUpdateDemo /> },
    { group: 'state', name: 'useRenderCount useIsFirstRender', node: <UseRenderCountDemo /> },
    { group: 'state', name: 'useControllableState', node: <UseControllableStateDemo /> },
    { group: 'lifecycle', name: 'useMount useUnmount', node: <UseMountDemo /> },
    { group: 'lifecycle', name: 'useUpdateEffect', node: <UseUpdateEffectDemo /> },
    { group: 'lifecycle', name: 'useIsMounted', node: <UseIsMountedDemo /> },
    { group: 'lifecycle', name: 'useDeepCompareEffect useDeepCompareMemo', node: <UseDeepCompareDemo /> },
    { group: 'lifecycle', name: 'useCustomCompareEffect useMemoCompare', node: <UseCustomCompareDemo /> },
    { group: 'lifecycle', name: 'useAsyncEffect', node: <UseAsyncEffectDemo /> },
    { group: 'lifecycle', name: 'useWhyDidYouUpdate useLogger', node: <UseWhyDidYouUpdateDemo /> },
    { group: 'timing', name: 'useDebounce useDebouncedState', node: <UseDebounceDemo /> },
    { group: 'timing', name: 'useDebouncedCallback', node: <UseDebouncedCallbackDemo /> },
    { group: 'timing', name: 'useThrottle useThrottledCallback', node: <UseThrottleDemo /> },
    { group: 'timing', name: 'useTimeout', node: <UseTimeoutDemo /> },
    { group: 'timing', name: 'useInterval', node: <UseIntervalDemo /> },
    { group: 'timing', name: 'useCountdown', node: <UseCountdownDemo /> },
    { group: 'timing', name: 'useStopwatch', node: <UseStopwatchDemo /> },
    { group: 'timing', name: 'useNow useRelativeTime', node: <UseNowDemo /> },
    { group: 'timing', name: 'useAnimationFrame useRafState', node: <UseAnimationFrameDemo /> },
    { group: 'timing', name: 'useIdle', node: <UseIdleDemo /> },
    { group: 'timing', name: 'useCountUp useTypewriter', node: <UseCountUpDemo /> },
    { group: 'timing', name: 'useDelayedLoading', node: <UseDelayedLoadingDemo /> },
    { group: 'storage', name: 'useLocalStorage', node: <UseLocalStorageDemo /> },
    { group: 'storage', name: 'useSessionStorage', node: <UseSessionStorageDemo /> },
    { group: 'storage', name: 'useCookie', node: <UseCookieDemo /> },
    { group: 'storage', name: 'useQueryParam useQueryParams', node: <UseQueryParamDemo /> },
    { group: 'storage', name: 'useHash', node: <UseHashDemo /> },
    { group: 'storage', name: 'useBroadcastChannel', node: <UseBroadcastChannelDemo /> },
    { group: 'storage', name: 'useIndexedDB', node: <UseIndexedDBDemo /> },
    { group: 'dom', name: 'useEventListener', node: <UseEventListenerDemo /> },
    { group: 'dom', name: 'useWindowSize useBreakpoint', node: <UseWindowSizeDemo /> },
    { group: 'dom', name: 'useScroll useScrollIntoView', node: <UseScrollDemo /> },
    { group: 'dom', name: 'useScrollLock', node: <UseScrollLockDemo /> },
    { group: 'dom', name: 'useScrollSpy', node: <UseScrollSpyDemo /> },
    { group: 'dom', name: 'useOnClickOutside', node: <UseOnClickOutsideDemo /> },
    { group: 'dom', name: 'useHover useFocus useFocusWithin', node: <UseHoverDemo /> },
    { group: 'dom', name: 'useKeyPress', node: <UseKeyPressDemo /> },
    { group: 'dom', name: 'useHotkeys shortcut', node: <UseHotkeysDemo /> },
    { group: 'dom', name: 'useKeySequence konami', node: <UseKeySequenceDemo /> },
    { group: 'dom', name: 'useLongPress', node: <UseLongPressDemo /> },
    { group: 'dom', name: 'useMouse', node: <UseMouseDemo /> },
    { group: 'dom', name: 'useElementSize useMeasure useResizeObserver', node: <UseElementSizeDemo /> },
    { group: 'dom', name: 'useInView useIntersectionObserver', node: <UseInViewDemo /> },
    { group: 'dom', name: 'useInfiniteScroll', node: <UseInfiniteScrollDemo /> },
    { group: 'dom', name: 'useMutationObserver', node: <UseMutationObserverDemo /> },
    { group: 'dom', name: 'useDraggable drag', node: <UseDraggableDemo /> },
    { group: 'dom', name: 'useSwipe', node: <UseSwipeDemo /> },
    { group: 'dom', name: 'useDropZone useFileDialog upload', node: <UseDropZoneDemo /> },
    { group: 'dom', name: 'useVirtualList', node: <UseVirtualListDemo /> },
    { group: 'browser', name: 'useMediaQuery useColorScheme', node: <UseMediaQueryDemo /> },
    { group: 'browser', name: 'useDarkMode theme', node: <UseDarkModeDemo dark={dark} /> },
    { group: 'browser', name: 'useDocumentTitle useFavicon usePageVisibility useWindowFocus useIsClient', node: <UseDocumentTitleDemo /> },
    { group: 'browser', name: 'useBeforeUnload', node: <UseBeforeUnloadDemo /> },
    { group: 'browser', name: 'usePreferredLanguages', node: <UseLanguagesDemo /> },
    { group: 'browser', name: 'useClipboard copy', node: <UseClipboardDemo /> },
    { group: 'browser', name: 'useFullscreen', node: <UseFullscreenDemo /> },
    { group: 'browser', name: 'useGeolocation', node: <UseGeolocationDemo /> },
    { group: 'browser', name: 'useBattery', node: <UseBatteryDemo /> },
    { group: 'browser', name: 'useDeviceOrientation useDeviceMotion useScreenOrientation', node: <UseSensorsDemo /> },
    { group: 'browser', name: 'useSpeechSynthesis useSpeechRecognition', node: <UseSpeechDemo /> },
    { group: 'browser', name: 'useNotification useShare useVibrate', node: <UseNotificationDemo /> },
    { group: 'browser', name: 'usePermission useWakeLock useEyeDropper', node: <UsePermissionDemo /> },
    { group: 'browser', name: 'useTextSelection', node: <UseTextSelectionDemo /> },
    { group: 'browser', name: 'useUserMedia useMediaDevices camera', node: <UseUserMediaDemo /> },
    { group: 'browser', name: 'useMediaControls useAudio', node: <UseMediaControlsDemo /> },
    { group: 'network', name: 'useAsync', node: <UseAsyncDemo /> },
    { group: 'network', name: 'useFetch', node: <UseFetchDemo /> },
    { group: 'network', name: 'useMutation', node: <UseMutationDemo /> },
    { group: 'network', name: 'usePolling', node: <UsePollingDemo /> },
    { group: 'network', name: 'useNetwork useOnline', node: <UseNetworkDemo /> },
    { group: 'network', name: 'useWebSocket', node: <UseWebSocketDemo /> },
    { group: 'network', name: 'useEventSource sse', node: <UseEventSourceDemo /> },
    { group: 'network', name: 'useScript useImage', node: <UseScriptDemo /> },
    { group: 'network', name: 'useWebWorker', node: <UseWebWorkerDemo /> },
    { group: 'forms', name: 'useForm', node: <UseFormDemo /> },
    { group: 'forms', name: 'useInput', node: <UseInputDemo /> },
    { group: 'forms', name: 'useSelection', node: <UseSelectionDemo /> },
    { group: 'forms', name: 'usePagination', node: <UsePaginationDemo /> },
    { group: 'forms', name: 'useSort useSearch', node: <UseSortSearchDemo /> },
    { group: 'utils', name: 'useLatest useEventCallback useConst', node: <UseLatestDemo /> },
    { group: 'utils', name: 'useMergeRefs', node: <UseMergeRefsDemo /> },
    { group: 'utils', name: 'useLockFn useAbortController', node: <UseLockFnDemo /> },
    { group: 'utils', name: 'createStore useStore', node: <UseStoreDemo /> },
    { group: 'utils', name: 'useEmitter useEmitterEvent', node: <UseEmitterDemo /> },
    { group: 'utils', name: 'useStateMachine', node: <UseStateMachineDemo /> },
    { group: 'utils', name: 'useToasts', node: <UseToastsDemo t={toasts} /> },
    { group: 'utils', name: 'useCssVariable', node: <UseCssVariableDemo /> },
  ], [dark, toasts])

  const { query, setQuery, results } = useSearch(demos, { keys: ['name'], debounce: 150 })
  const visible = results.filter((d) => group === 'all' || d.group === group)

  return (
    <div className="layout">
      <h1>⚛️ React Hooks Kit</h1>
      <p className="sub">
        {demos.length} دمو · React {`19.3`} + Vite + TypeScript · کد هر دمو را در <code>src/App.tsx</code> با کامنت فارسی ببین
      </p>

      <div className="toolbar">
        <input ref={searchRef} placeholder="جست‌وجوی هوک… (Ctrl/⌘ + /)" value={query} onChange={(e) => setQuery(e.target.value)} style={{ minWidth: 220 }} />
        <button className={'chip' + (group === 'all' ? ' on' : '')} onClick={() => setGroup('all')}>همه</button>
        {GROUPS.map((g) => (
          <button key={g.id} className={'chip' + (group === g.id ? ' on' : '')} onClick={() => setGroup(g.id)}>{g.title}</button>
        ))}
        <button className="chip" onClick={dark.toggle}>{dark.isDark ? '🌙' : '🌞'}</button>
      </div>

      {GROUPS.map((g) => {
        const items = visible.filter((d) => d.group === g.id)
        if (!items.length) return null
        return (
          <section className="group" id={`group-${g.id}`} key={g.id}>
            <h2>{g.title}</h2>
            <div className="grid">
              {items.map((d) => <div key={d.name} style={{ display: 'contents' }}>{d.node}</div>)}
            </div>
          </section>
        )
      })}
      {!visible.length && <p className="muted">چیزی پیدا نشد.</p>}

      <div className="toast-wrap">
        {toasts.toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.type} onClick={() => toasts.remove(t.id)}>{t.message}</div>
        ))}
      </div>
    </div>
  )
}
