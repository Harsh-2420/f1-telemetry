#!/bin/bash

# Build the executable
go build .

# Determine the operating system
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac

# Run the executable based on the operating system
if [ "$machine" == "Linux" ] || [ "$machine" == "Mac" ]; then
    ./TelemetryParser
elif [ "$machine" == "Cygwin" ] || [ "$machine" == "MinGw" ]; then
    ./TelemetryParser.exe
else
    echo "Unsupported operating system: $machine"
    exit 1
fi