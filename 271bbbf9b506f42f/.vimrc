set expandtab
set ts=4 sw=4 sts=4

function! StrTrim(txt)
  return substitute(a:txt, '^\n*\s*\(.\{-}\)\n*\s*$', '\1', '')
endfunction

let $PATH = StrTrim(system('npm bin')).":".$PATH
