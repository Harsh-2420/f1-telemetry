package main

import (
	"fmt"
	"log"
	"math"
	"os"
)

type Vec3 struct {
	X float32
	Y float32
	Z float32
}

var logger log.Logger

func InitLogger(logToFile bool) {
	if logToFile {
		f, err := os.Create("console.log")
		if err != nil {
			fmt.Println(err)
			panic("Failed to initialize logger")
		}

		logger = *log.New(f, "", log.Lmicroseconds)
	} else {
		logger = *log.New(os.Stdout, "", log.Lmicroseconds)
	}
}

func GetLogger() *log.Logger {
	return &logger
}

func (v *Vec3) Magnitude() float32 {
	s := (v.X * v.X) + (v.Y * v.Y) + (v.Z + v.Z)
	return float32(math.Sqrt(float64(s)))
}
