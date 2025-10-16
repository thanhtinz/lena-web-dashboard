#!/bin/bash

# Auto-restart Discord bot script with sharding support
# Set USE_SHARDING=true to enable sharding, or leave empty/false for single process

while true; do
    if [ "$USE_SHARDING" = "true" ]; then
        echo "🚀 Starting Lena bot with SHARDING..."
        node sharding/start.js
    else
        echo "🌸 Starting Lena bot (single process)..."
        node index.js
    fi
    
    EXIT_CODE=$?
    echo "💤 Bot stopped with exit code $EXIT_CODE"
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "😴 Bot sleeping... will wake up in 3 seconds..."
        sleep 3
        echo "🌟 Bot waking up!"
    else
        echo "❌ Bot crashed! Restarting in 3 seconds..."
        sleep 3
    fi
done
