from pathlib import Path

page = Path('index.html')
html = page.read_text()
needle = "function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?84:96}"
assert html.count(needle) == 1, 'Expected original hanger size function exactly once'
html = html.replace(needle, "function hangerFrameSize(){return window.matchMedia('(max-width:650px)').matches?58:72}")
css = '''
/* Shop hanger: compact decorative indicator; sprite frames match JS sizes. */
.clothes-hanger{width:72px;height:72px;left:-26px;background-size:432px 72px}
@media(max-width:650px){.clothes-hanger{width:58px;height:58px;left:-19px;background-size:348px 58px}}
'''
assert html.count('</style>') == 1
assert '/* Shop hanger: compact decorative indicator' not in html
html = html.replace('</style>', css + '</style>')
page.write_text(html)

test = Path('tests/store-regression.mjs')
source = test.read_text()
for old, new in [('/background-size:576px 96px/', '/background-size:432px 72px/'), ('/background-size:504px 84px/', '/background-size:348px 58px/')]:
    assert source.count(old) == 1, f'Expected one assertion: {old}'
    source = source.replace(old, new)
test.write_text(source)
print('Updated hanger CSS 72/58, JavaScript frames 72/58, and test expectations.')
