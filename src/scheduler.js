let queued = false
const queue = []
const p = Promise.resolve()

//nexttick实现
export const nextTick = fn => p.then(fn)

//增加任务到队列中
export const queueJob = (job) => {
  if (!queue.includes(job)) queue.push(job)
  if (!queued) {
    queued = true
    nextTick(flushJobs)
  }
}
//消化任务队列
const flushJobs = () => {
  for (let i = 0; i < queue.length; i++) {
    queue[i]()
  }
  queue.length = 0
  queued = false
}
