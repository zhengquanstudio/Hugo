---
author: 余温Gueen
categories:
    - 编程
coverImg: https://img.xxdevops.cn/blog/article_cover/go-concurrency.webp
date: "2025-10-17T12:00:00+08:00"
description: 深入讲解 Go 语言的 Goroutine、Channel 和并发编程最佳实践
draft: false
tags:
    - Go
    - 并发
    - Goroutine
    - Channel
title: Go 语言并发编程模式详解
url: /code/iffls
---
## Go 并发基础

Go 语言通过 Goroutine 和 Channel 提供了强大的并发编程能力。

### Goroutine 基础

```go
package main

import (
    "fmt"
    "time"
)

func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    go sayHello() // 启动 goroutine
    time.Sleep(time.Second) // 等待 goroutine 完成
    fmt.Println("Main function")
}
```

### Channel 通信

```go
func main() {
    ch := make(chan string)

    go func() {
        ch <- "Hello from goroutine"
    }()

    msg := <-ch
    fmt.Println(msg)
}
```

## 常用并发模式

### Worker Pool 模式

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, j)
        time.Sleep(time.Second)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // 启动 3 个 worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // 发送 5 个任务
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    // 收集结果
    for a := 1; a <= 5; a++ {
        <-results
    }
}
```

### Fan-out/Fan-in 模式

```go
func producer(ch chan<- int) {
    for i := 0; i < 10; i++ {
        ch <- i
    }
    close(ch)
}

func worker(in <-chan int, out chan<- int) {
    for n := range in {
        out <- n * n
    }
}

func main() {
    in := make(chan int)
    out := make(chan int)

    // Fan-out: 启动多个 worker
    for i := 0; i < 3; i++ {
        go worker(in, out)
    }

    go producer(in)

    // Fan-in: 收集结果
    for i := 0; i < 10; i++ {
        fmt.Println(<-out)
    }
}
```

### Select 多路复用

```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "from channel 1"
    }()

    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "from channel 2"
    }()

    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println(msg1)
        case msg2 := <-ch2:
            fmt.Println(msg2)
        }
    }
}
```

## Context 上下文管理

```go
import "context"

func operation(ctx context.Context) {
    select {
    case <-time.After(2 * time.Second):
        fmt.Println("Operation completed")
    case <-ctx.Done():
        fmt.Println("Operation cancelled:", ctx.Err())
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()

    go operation(ctx)
    time.Sleep(3 * time.Second)
}
```

## 并发安全

### Mutex 互斥锁

```go
import "sync"

type SafeCounter struct {
    mu sync.Mutex
    count int
}

func (c *SafeCounter) Inc() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

func (c *SafeCounter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.count
}
```

### sync.WaitGroup

```go
func main() {
    var wg sync.WaitGroup

    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Printf("Worker %d done\n", id)
        }(i)
    }

    wg.Wait() // 等待所有 goroutine 完成
    fmt.Println("All workers done")
}
```

## 最佳实践

1. **避免过度使用 Goroutine** - 每个 Goroutine 都有内存开销
2. **正确关闭 Channel** - 防止 Goroutine 泄漏
3. **使用 Context 管理生命周期** - 优雅地取消操作
4. **注意竞态条件** - 使用 race detector 检测

## 总结

Go 的并发模型简洁而强大，掌握这些模式能够编写出高效、可靠的并发程序。
