echo ================================================
echo -e "\033[1mPulling HTML client\033[0m"
echo ================================================
git pull
echo ================================================
echo -e "\033[1mPulling mobile client\033[0m"
echo ================================================
cd ..
cd expressmobile/
git checkout dev
git pull
echo Maccabi Zona
echo ================================================
echo -e "\033[1mPulling Server\033[0m"
echo ================================================
cd ..
cd wix-mobile/
git checkout client-dev
git pull
echo -en '\E[47;31m'"\033[1mHapoel Imperia\033[0m"
echo 
cd ..
cd html-wysiwyg/
pwd	