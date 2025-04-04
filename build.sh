#!/usr/bin/env bash
set -e
TARGETS=${1:-"world redis mongodb elasticsearch mariadb"}

for part in $TARGETS; do
  dir="hello-$part"
  file="app-$part-pod"
  printf "Building $dir: "
  cd $dir
  IMAGE_ID=$(docker build -q .)
  cd ..
  docker save -o $file.tar ${IMAGE_ID:7:12}
  echo "${IMAGE_ID:7:12}"
  gzip -9 $file.tar
done
