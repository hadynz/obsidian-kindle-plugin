import { remote } from 'electron';

const { dialog } = remote;

const syncKindleClippings = async (): Promise<void> => {
  const result = await dialog.showOpenDialog(remote.getCurrentWindow(), {
    filters: [{ name: 'Text file', extensions: ['txt'] }],
    properties: ['openFile'],
  });

  if (result.canceled === false) {
    console.log('selected file', result.filePaths[0]);
  }
};

export default syncKindleClippings;
