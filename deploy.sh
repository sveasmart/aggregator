#!/usr/bin/env bash

rm aggregator.zip
zip -r aggregator.zip *
aws lambda update-function-code --function-name aggregator --profile Administrator --zip-file fileb://aggregator.zip
