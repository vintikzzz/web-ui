export function ls(torrent, pwd, file = null) {
  if (torrent == null) return [];
  let tree = {};
  const addBranch = (tree, parts, file) => {
    if (parts.length == 0) return file;
    const part = parts.shift();
    if (tree[part] == undefined) {
      tree[part] = addBranch({}, parts, file);
    } else {
      tree[part] = addBranch(tree[part], parts, file);
    }
    return tree;
  };
  for (let file of torrent.files) {
    const pathParts = file.path.split('/');
    tree = addBranch(tree, pathParts, file);
  }
  let pwdParts = pwd.substring(1).split('/');
  if (pwdParts[0] == '') pwdParts = [];
  let currentDir = tree;
  for (let pwdPart of pwdParts) {
    currentDir = currentDir[pwdPart];
  }
  const res = [];
  if (!file) {
    res.push({
      name: '.',
      type: 'dir',
      path: '/',
    });
    pwdParts.pop();
    let upPath = '/';
    if (pwdParts.length > 0) {
      upPath = '/' + pwdParts.join('/');
    }
    res.push({
      name: '..',
      type: 'dir',
      path: upPath,
    });
  }
  for (let t in currentDir) {
    if (file && file != t) continue;
    let item = {};
    item.name = t;
    if (pwd == '/') {
      item.path = `/${t}`;
    } else {
      item.path = `${pwd}/${t}`;
    }
    if (currentDir[t].length !== undefined) {
      item.type = 'file';
      item.length = currentDir[t].length;
    } else {
      item.type = 'dir';
    }
    res.push(item);
  }
  return res.sort((a, b) => a.name.localeCompare(b.name));
};
