package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
)

func main() {
	args := os.Args
	options := []string{"--file", "--numbilets", "--parameter"}
	optionToValue := make(map[string]string, 0)
	for _, option := range options {
		for i, arg := range args {
			if arg == option && i < len(args)-1 {
				optionToValue[option] = args[i+1]
			}
		}
		if _, exists := optionToValue[option]; !exists {
			fmt.Println("Your call doesn't match the example: program --file data/test --numbilets 20 --parameter 42")
			return
		}
	}

	numbilets, err := strconv.Atoi(optionToValue["--numbilets"])
	if err != nil {
		return
	}
	parameter, err := strconv.Atoi(optionToValue["--parameter"])
	if err != nil {
		return
	}

	readFile, err := os.Open(optionToValue["--file"])
	if err != nil {
		return
	}
	fileScanner := bufio.NewScanner(readFile)
	fileScanner.Split(bufio.ScanLines)
	var students []string
	for fileScanner.Scan() {
		students = append(students, fileScanner.Text())
	}
	err = readFile.Close()
	if err != nil {
		return
	}

	random := NewRandom(parameter, 1, numbilets)
	variants := random.GetAll(students)
	for i, student := range students {
		fmt.Printf("%s: %d\n", student, variants[i])
	}
}
