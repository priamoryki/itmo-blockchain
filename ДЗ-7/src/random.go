package main

import (
	"crypto/sha256"
	"math/big"
)

type Random struct {
	seed *big.Int
	min  int
	max  int
}

func NewRandom(seed int, min int, max int) *Random {
	return &Random{
		seed: big.NewInt(int64(seed)),
		min:  min,
		max:  max,
	}
}

func (random *Random) Get(name string) int {
	h := sha256.New()
	h.Write([]byte(name))
	h.Write(random.seed.Bytes())
	hashBytes := h.Sum(nil)
	parts := 4
	partSize := len(hashBytes) / parts
	variant := 0
	for i := 0; i < parts; i++ {
		indent := partSize * i
		variant += int(hashBytes[indent+1]) * (1 << indent)
	}
	return variant%(random.max-random.min+1) + random.min
}

func (random *Random) GetAll(arr []string) []int {
	result := make([]int, 0, len(arr))
	for _, name := range arr {
		result = append(result, random.Get(name))
	}
	return result
}
