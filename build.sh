#!/usr/bin/env bash
for dir in hello-world hello-redis hello-mongodb hello-elasticsearch; do
  echo "Building $dir"
  cd $dir
  IMAGE_ID=$(docker build -q .)
  cd ..
  docker save -o $dir.tar ${IMAGE_ID:7:12}
  gzip -9 $dir.tar
done
