"""Read cell values and formulas from an .xlsx/.xlsm with the standard library.

Used to read the EPB Center's ISO 52016-1 / 52010-1 demo workbooks (no
openpyxl needed): WB(path).cells(sheet) -> {"A1": (cached value, formula)}.
The Strasbourg oracle for test_iso52010.py was exported from
Demo_ISO_52010-1_Output_TMY_Strasbourg_2021-10-01.xlsx, sheet `data`,
rows 21.., columns E..AL.
"""
import zipfile, re, sys, xml.etree.ElementTree as ET
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
class WB:
    def __init__(s,p):
        s.z=zipfile.ZipFile(p)
        wb=ET.fromstring(s.z.read('xl/workbook.xml'))
        rels=ET.fromstring(s.z.read('xl/_rels/workbook.xml.rels'))
        rmap={r.get('Id'):r.get('Target') for r in rels}
        s.sheets={}
        for sh in wb.find('m:sheets',NS):
            t=rmap[sh.get('{%s}id'%NS['r'])]; s.sheets[sh.get('name')]='xl/'+t.lstrip('/').replace('xl/','')
        try:
            ss=ET.fromstring(s.z.read('xl/sharedStrings.xml'))
            s.ss=[''.join(x.itertext()) for x in ss.findall('m:si',NS)]
        except KeyError: s.ss=[]
        s.cache={}
    def cells(s,name):
        if name in s.cache: return s.cache[name]
        root=ET.fromstring(s.z.read(s.sheets[name])); out={}
        shared={}
        for c in root.iter('{%s}c'%NS['m']):
            r=c.get('r'); f=c.find('m:f',NS); v=c.find('m:v',NS); t=c.get('t')
            val=v.text if v is not None else None
            if t=='s' and val is not None: val=s.ss[int(val)]
            ftxt=None
            if f is not None:
                ftxt=f.text
                if f.get('t')=='shared':
                    si=f.get('si')
                    if ftxt: shared[si]=(r,ftxt)
                    else: ftxt='<shared '+si+' from '+shared.get(si,('?',''))[0]+'> '+shared.get(si,('',''))[1]
            out[r]=(val,ftxt)
        s.cache[name]=out; return out
