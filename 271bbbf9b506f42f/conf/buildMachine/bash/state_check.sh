#!/bin/bash

echo "---"
echo "df:"
command df -h

echo "---"
if [ -f ~/.npmrc ]
  then
    echo "--- cat ~/.npmrc:"
    echo "---"
    cat ~/.npmrc
    echo "---"
  else
    echo "~/.npmrc not found"
fi

if [ -f ./.npmrc ]
  then
    echo "--- cat ./.npmrc:"
    echo "---"
    cat ./.npmrc
    echo "---"
  else
    echo "./.npmrc not found"
fi

echo '-------------------'
echo 'ssh git@github.com:'
ssh git@github.com
echo '-------------------'


if [ -d ~/.ssh ]
  then
    echo "--- ls -lah ~/.ssh"
    echo "---"
    ls -lah ~/.ssh
    echo "---"
  else
    echo "~/.ssh not found"
fi

echo "--- env variables:"
echo "---"
echo GEM_HOME: $GEM_HOME
echo GEM_PATH: $GEM_PATH
echo BUNDLE_PATH: $BUNDLE_PATH
echo PATH: $PATH
echo "---"

echo '--- which and versions'
echo "---"
for TYPE in 'ruby' 'bundle' 'node' 'npm' 'nvm' 'python' 'make' 'gcc'
do
  echo $TYPE: && which $TYPE && $TYPE --version || echo $TYPE not found
done
echo "---"
