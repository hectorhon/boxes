import os, re, json
import requests

class MyException(Exception):
  pass

path = os.path.expanduser('~/Downloads/contacts.vcf')

with open(path, 'r') as f:

  line_count = 0
  line = None
  entries = []

  def next():
    global line_count, line
    line = f.readline()
    line_count += 1
    if line == '':
      raise MyException
    line = line[:-1]

    if line.startswith('PHOTO'):
      more_line = f.readline()
      line_count += 1
      while more_line.startswith(' '):
        line += more_line[1:-1]
        more_line = f.readline()
        line_count += 1

      assert more_line == '\n'

  try:
    # while line_count < 1000:
    while True:
      next()

      if not line == 'BEGIN:VCARD':
        raise Exception(f'vcf format error, expected BEGIN:VCARD, got {line} instead')

      entry = {}
      next()

      while not line == 'END:VCARD':
        p = re.compile('(.*?):(.*)')
        m = p.match(line)

        attr = m.group(1)
        val = m.group(2)

        if not attr in entry:
          entry[attr] = [val]
        else:
          entry[attr].append(val)

        next()

      # print(json.dumps(entry, indent=4))
      entries.append(entry)

      try:
        url = 'http://localhost:3000/contacts/newVcard?batch=initial'
        response = requests.post(url, entry)
        response.raise_for_status()
      except requests.exceptions.RequestException:
        print(response.text)
        raise

  except MyException:
    print('done')

  unique_keys = {}
  for entry in entries:
    for key in entry.keys():
      if not key in unique_keys:
        unique_keys[key] = 1
      else:
        unique_keys[key] += 1

  print(json.dumps(unique_keys, indent=4))
