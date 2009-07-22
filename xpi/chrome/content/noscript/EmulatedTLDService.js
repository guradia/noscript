const EmulatedTLDService = {
  _idnService: Components.classes["@mozilla.org/network/idn-service;1"].
            getService(Components.interfaces.nsIIDNService),

  getBaseDomainFromHost: function(domain) {
    domain = this._idnService.normalize(domain);
    var pos = domain.search(this._tldEx);
    if(pos < 0) {
      pos = domain.search(this._tldRx);
      if(pos >= 0) pos = domain.lastIndexOf(".", pos - 1) + 1;
    } else if(domain[pos] == ".") {
      ++pos;
    }
    return pos < 0 ? domain : domain.substring(pos);
  },

  getPublicSuffixFromHost: function(domain) {
    domain = this._idnService.normalize(domain);
    var pos = domain.search(this._tldEx);
    if(pos < 0) {
      pos = domain.search(this._tldRx);
      if(pos >= 0 && domain[pos] == ".") pos++;
    } else {
      pos = domain.indexOf(".", pos + 1) + 1;
    }
    return pos < 0 ? "" : domain.substring(pos);
  },
  
  _tldRx: /(?:\.|^)(?:a(?:c(?:\.(?:a[et]|i[mnr]|[bs]e|[cv]n|jp|[kp]r|[mr]w|tj|ug)|cident-(?:investiga|preven)tion\.aero|t\.(?:edu|gov)\.au|a\.pro)?|d(?:ult\.ht|\.jp)?|e(?:ro(?:(?:batic|club|drome)\.aero|port\.fr|\.tt)?|jrie\.no)?|g(?:r(?:ar\.hu|igento\.it|o\.pl)|(?:ents\.aer|denes\.n)o|\.it)?|i(?:r(?:-(?:surveillance|traffic-control)\.aero|(?:(?:craf|por)t|line|traffic)\.aero)|d\.pl)?|m(?:(?:(?:bulance|usement)\.aer|(?:li|ot)\.n)o)?|s(?:s(?:o(?:\.(?:dz|fr|ht|mc|re)|ciation\.aero)|edic\.fr|n\.lk)|coli\-?piceno\.it|n(?:\.lv|es\.no)|k(?:er|im|voll|[oø]y)\.no|ti\.it|eral\.no)?|u(?:t(?:hor\.aero|o\.pl)|r(?:skog-h[oø]land\.no|(?:e|land)\.no)|st(?:evoll|rheim)\.no|(?:dnedaln|kra)\.no|gustow\.pl)|f(?:jord\.no)?|n(?:d(?:ebu|[oø]y|asuolo)\.no|(?:cona)?\.it)?|o(?:st[ae]\.it|\.it)?|q(?:(?:uila)?\.it)?|t(?:\.it|m\.pl)?|z(?:\.us)?|b\.(?:ca|se)|h\.(?:cn|no)|r(?:t(?:\.(?:dz|ht|pl)|s\.(?:nf|ro))|e(?:zzo\.it|(?:mark|ndal)\.no)|\.(?:it|us)|(?:na|dal)\.no)|v(?:o(?:cat|ues)\.fr|e(?:r[oø]y\.no|llino\.it)|\.it)|l(?:es(?:sandria\.it|und\.no)|\.(?:it|no|us)|t(?:o\-?adige\.it|a\.no)|(?:gard|stahaug|aheadju|vdal)\.no)|a(?:rborte)?\.no|k(?:(?:rehamn|noluokta)\.no|\.us)|[wx]|p\.it)|c(?:o(?:m(?:\.(?:a[cfgilnwz]|b[abmos]|c[nu]|d[mz]|e[ces]|g[eipr]|h[knrt]|k[giyz]|l[ckvy]|m[gkow]|n[fr]|p[fhklrst]|r[eouw]|s[cdg]|t[jtw]|u[az]|v[in]|fr|is|jo)|o\.it)?|n(?:f(?:erence\.aero|\.lv)|sult(?:ant|ing)\.aero|trol\.aero)|\.(?:a[gt]|i[mnrt]|j[ep]|m[aw]|t[jt]|u[gsz]|ba|gg|hu|kr|ls|pn|rw)|op(?:\.(?:[ht]t|mw))?|uncil\.aero|senza\.it)|a(?:t(?:an(?:ia|zaro)\.it|ering\.aero)?|s(?:ino\.hu|erta\.it)|\.(?:it|us)|(?:(?:a|rgo)\.aer|hcesuolo\.n)o|(?:gliari|ltanissetta|mpobasso)\.it)?|e(?:rtification\.aero|\.it)|h(?:a(?:m(?:pionship\.aero|bagri\.fr)|rter\.aero)|i(?:rurgiens-dentistes\.fr|eti\.it)|er(?:n(?:igov|ovtsy)\.ua|kassy\.ua)|\.it)?|i(?:vilaviation\.aero|ty\.hu|eszyn\.pl)?|l(?:ub\.(?:aero|tw)|\.it)?|r(?:e(?:w\.aero|mona\.it)|(?:otone)?\.it|imea\.ua)|c(?:i\.fr)?|n(?:\.(?:it|ua))?|u(?:neo\.it)?|v(?:\.ua)?|z(?:e(?:ladz|st)\.pl|\.it)?|t\.(?:it|us)|[dfgmx]|q\.cn|[bs]\.it|(?:áhcesuolo\.n|pa\.pr)o|\.se|k\.ua)|e(?:d(?:u(?:\.(?:a[cflnz]|b[abmos]|c[nu]|e[cs]|g[eipr]|h[knt]|i[nqs]|k[giyz]|l[ckvy]|m[gknow]|p[fhklnrst]|s[cdg]|t[jtw]|v[in]|dz|jo|nr|rw|ua)|cator\.aero)?|\.jp)|n(?:g(?:ine(?:er)?\.aero|(?:erdal\.n|\.pr)o)|(?:tertainment\.aer|ebakk\.n)o|(?:na)?\.it)|x(?:p(?:ress\.aero|erts-comptables\.fr)|change\.aero)|s(?:t\.pr)?|roti[ck]a\.hu|i(?:d(?:s(?:(?:ber|ko)g|voll)\.no|(?:fjord)?\.no)|gersund\.no)|l(?:verum\.no|(?:blag|k)\.pl)|tne(?:dal)?\.no|v(?:en(?:es|(?:ass|ášš)i)\.no|je-og-hornnes\.no)|(?:(?:mergency|quipment)\.aer|gersund\.n)o|164\.arpa|[cu]|(?:\.s)?e|biz\.tw)|g(?:o(?:v(?:\.(?:a[ceflz]|b[abmos]|c[nu]|e(?:c|du)|g[egir]|i[mnqrs]|j[eo]|k[giyz]|l[ckvy]|m[agknow]|p[hklnrst]|s[cdg]|t[jtw]|v[in]|dz|hk|nr|rw|ua)|ernment\.aero)?|b\.(?:bo|es|hn|pk)|uv\.(?:fr|ht|rw)|r(?:izia\.it|lice\.pl)|\.(?:it|jp|kr|tj|ug)|l\.no|[knpsa]\.pk)|l(?:i(?:ding\.aero|wice\.pl)|o(?:ppen\.no|gow\.pl))?|r(?:o(?:u(?:ndhandling|p)\.aero|sseto\.it|ng\.no)|\.(?:it|jp)|a(?:n(?:e|vin)?\.no|tangen\.no|jewo\.pl)|eta\.fr|p\.lk|(?:imstad|ue)\.no)?|d(?:a(?:nsk)?\.pl|\.cn|ynia\.pl)?|s(?:\.(?:a[ah]\.no|h[lm]\.no|n[lt]\.no|o(?:[fl]|slo)\.no|s(?:[ft]|valbard)\.no|t[mr]\.no|v[af]\.no|cn|(?:bu|fm|jan-mayen|mr|rl)\.no)|m\.pl)?|e(?:n(?:ov?a\.it|\.in)|ometre-expert\.fr|\.it)?|a(?:m(?:e(?:s\.hu|\.tw)|vik\.no)|u(?:lar|sdal)\.no|(?:ngaviik|ls|ivuotn)a\.no|\.us)?|i(?:ldesk[aå]l\.no|(?:ske|ehtavuoatna)\.no)?|m(?:ina\.pl)?|á(?:ŋgaviika|(?:lsá|ivuotna)\.no)|j(?:e(?:r(?:drum|stad)\.no|(?:mnes|sdal)\.no)|[oø]vik\.no)|u(?:len|ovdageaidnu)\.no|v\.at|[zx]\.cn|[fgpqwy]|niezno\.pl|\.se)|n(?:e(?:t(?:\.(?:a[cefgilnz]|b[abmos]|c[nu]|d[mz]|g[egpr]|h[knt]|i[mnrs]|j[eo]|k[giyz]|l[kvy]|m[akow]|n[fr]|p[hklnrst]|r[uw]|s[cdg]|t[jtw]|ec|ua|vn))?|\.(?:u[gs]|jp|kr)|s(?:odd(?:tang)?en\.no|\.(?:akershus|buskerud)\.no|se(?:by|t)\.no|na\.no)|ws\.hu|dre-eiker\.no)?|o(?:m(?:\.(?:a[dg]|r[eo]|es|fr|mg|pl)|e\.pt)|t(?:aires\.fr|(?:odden|teroy)\.no)|r(?:d(?:-(?:(?:aur|o)dal|fron)\.no|re(?:-land|isa)\.no|(?:dal|kapp)\.no)|e-og-uvdal\.no)|(?:vara)?\.it|waruda\.pl)?|a(?:m(?:e(?:\.(?:a[ez]|t[jt]|[hp]r|vn))?|s(?:os|skogan)\.no|dalseid\.no)|v(?:igation\.aer|uotna\.n)o|p(?:oli|les)\.it|r(?:vi(?:k|ika)\.no|oy\.no)|\.it|(?:amesjevuemie|nnestad|ustdal)\.no|klo\.pl)?|s(?:w\.(?:edu|gov)\.au|\.ca|n\.us)|t\.(?:(?:edu|gov)\.au|ca|[nr]o)|f(?:\.ca)?|l(?:\.(?:ca|no))?|u(?:\.(?:ca|it)|oro\.it)?|m\.(?:cn|us)|i(?:c\.i[mn]|(?:ss|tt)edal\.no|eruchomosci\.pl|kolaev\.ua)|g(?:o\.(?:p[hl]|lk))?|c(?:\.us)?|y(?:sa\.pl|\.us)|b\.ca|x\.cn|(?:ávuotna|ååmesjevuemie|(?:æ|øtte)røy)\.no|r|\.se|[dhjv]\.us)|m(?:i(?:l(?:\.(?:a[cez]|b[ao]|k[gz]|p[hl]|t[jw]|ec|[gs]e|[hi]n|[jn]o|lv|mg|rw)|ano?\.it)?|\.(?:it|us)|d(?:sund|tre-gauldal)\.no|el(?:ec|no)\.pl|crolight\.aero|asta\.pl)|a(?:i(?:ntenance\.aero|l\.pl)|r(?:ke(?:tplace\.aer|r\.n)o|nardal\.no)|n(?:tova\.it|dal\.no)|s(?:sa\-?carrara\.it|(?:oy|fjorden)\.no)|t(?:era\.it|ta-varjjat\.no)|l(?:(?:vik|selv|atvuopmi)\.no|(?:bork|opolska)\.pl)|z(?:owsze|ury)\.pl|gazine\.aero|cerata\.it|\.us)?|e(?:d(?:ia\.(?:aero|hu|pl)|\.(?:p(?:l|ro)|ec|ht|ly|sd)|ecin\.fr)|\.(?:it|us)|l(?:and|dal|hus|[oø]y)\.no|r[aå]ker\.no|ssina\.it)|o(?:d(?:e(?:lling\.aero|na\.it)|\.gi|(?:alen|um)\.no)|\.(?:it|us)|bi(?:\.tt)?|s(?:j[oø]en\.no|(?:(?:kene)?s|vik)\.no)|nza\.it|(?:-i-rana|(?:[aå]rek|ld)e)\.no)?|b(?:\.ca|one\.pl)|c(?:\.it)?|n(?:\.(?:it|us))?|s(?:\.(?:it|us))?|t\.(?:it|us)|d(?:\.us)?|k(?:\.ua)?|r(?:\.no|agowo\.pl)?|u(?:seum(?:\.(?:no|tt))?|os[aá]t\.no)?|j[oø]ndalen\.no|å(?:søy|lselv)\.no|á(?:latvuopmi|tta-várjjat)\.no|yname\.jo|[ghpqw]|\.se)|o(?:r(?:g(?:\.(?:a[cefgilnz]|b[abmos]|c[nu]|d[mz]|e[ces]|g[egipr]|h[kntu]|i[mnrs]|j[eo]|k[giyz]|l[cksvy]|m[agknow]|p(?:[fhknrst]|l )|r[ou]|s[cdeg]|t[jtw]|v[in]|nr|ua))?|\.(?:u[gs]|[ai]t|jp|kr)|k(?:anger|dal)\.no|s(?:kog|ta)\.no|istano\.it|land\.no)|f(?:f\.ai|\.no)|l(?:\.no|(?:awa|ecko|kusz|sztyn)\.pl)|s(?:\.h(?:edmark|ordaland)\.no|t(?:er[oø]y\.no|r(?:o(?:w(?:iec|wlkp)\.pl|(?:d|lek)a\.pl)|e-toten\.no))|(?:(?:l|[oø]yr)o|en)\.no)|d(?:da\.no|(?:essa)?\.ua)|k(?:snes\.no|\.us)|p(?:p(?:eg[aå]rd\.no|dal\.no)|o(?:czno|le)\.pl)|v(?:erhalla|re-eiker)\.no|y(?:er|garden|stre-slidre)\.no|n\.ca|ther\.nf|masvuotna\.no|\.se|h\.us)|s(?:c(?:h\.(?:l[ky]|[aj]e|gg|ir)|\.(?:u[gs]|cn)|ientist\.aero)?|a(?:\.(?:(?:edu|gov)\.au|it)|l(?:erno\.it|(?:angen|tdal)\.no)|n(?:d(?:nes(?:sj[oø]en\.no|\.no)|e(?:\.(?:m[oø]re-og-romsdal\.no|vestfold\.no)|fjord\.no)|[oø]y\.no)|ok\.pl)|u(?:da|herad)\.no|(?:fety\.aer|(?:mnanger|rpsborg)\.n)o|(?:ssari|vona)\.it)|e(?:x\.(?:hu|pl)|l(?:j(?:e|ord)\.no|(?:bu)?\.no)|rvices\.aero|jny\.pl|c\.ps|bastopol\.ua)?|h(?:o(?:p\.(?:h[tu]|pl)|w\.aero)|\.cn)?|k(?:edsmo(?:korset)?\.no|a(?:n(?:land|it)\.no|un\.no)|i(?:e(?:rv[aá]\.no|n\.no)|(?:ptvet)?\.no)|j(?:erv[oø]y\.no|[aå]k\.no)|o(?:dje\.no|czow\.pl)|(?:ydiving\.aer|(?:ånland|ánit)\.n)o|\.ca|lep\.pl)?|o(?:n(?:dr(?:io\.it|e-land\.no)|gdalen\.no)|\.(?:it|gov\.pl)|gn(?:dal|e)\.no|l(?:a|und)\.no|r(?:-(?:(?:aur|o)dal|fron|varanger)\.no|(?:(?:tlan|fol)d|reisa|um)\.no)|s(?:nowiec)?\.pl|(?:ftware\.aer|(?:kndal|mna)\.n)o|c\.lk|pot\.pl)|t(?:o(?:r(?:e\.(?:nf|ro)|d(?:al)?\.no|(?:-elvdal|fjord)\.no)|kke\.no)|a(?:t(?:helle)?\.no|v(?:ern|anger)\.no|r(?:ostwo\.gov|achowice|gard)\.pl|nge\.no|lowa-wola\.pl)|j(?:ordal(?:shalsen)?\.no|ørdal(?:shalsen)?\.no)|ei(?:gen|nkjer)\.no|r(?:anda?\.no|yn\.no)|(?:udent\.aer|\.n)o)?|d(?:\.(?:cn|us))?|n(?:a(?:sa|ase)\.no|å(?:sa|ase)\.no|\.cn|(?:illfjord|oasa)\.no)?|p(?:ort\.hu|\.it|(?:jelkavik|ydeberg)\.no)|u(?:l(?:i\.hu|(?:a|dal)\.no)|n(?:d|ndal)\.no|edtirol\.it|rnadal\.no|walki\.pl|my\.ua)?|z(?:cz(?:ecin|ytno)\.pl|ex\.hu|kola\.pl)?|v(?:e(?:io|lvik)\.no|\.it|albard\.no)|i(?:e(?:na\.it|llak\.no)|r(?:acusa\.it|dal\.no)|\.it|(?:gdal|ljan)\.no)?|r(?:\.(?:it|gov\.pl))?|l(?:a(?:ttum\.no|sk\.pl)|upsk\.pl)?|ál[áa]t\.no|m(?:[oø]la\.no)?|ø(?:r(?:-(?:(?:aur|o)dal|fron|varanger)\.no|(?:fold|reisa|um)\.no)|(?:gne|mna|ndre-land)\.no)|wi(?:dnica|ebodzin|noujscie)\.pl|x\.cn|s\.it|(?:f|ykkylven)\.no|\.se|g)|p(?:r(?:o(?:\.(?:ae|ec|[ht]t|pr|vn)|duction\.aero|chowice\.pl|f\.pr)?|ess(?:\.(?:aero|se)|e\.fr)|i(?:v\.(?:hu|no|pl)|\.ee)|d\.(?:fr|mg)|(?:ato)?\.it|(?:uszkow|zeworsk)\.pl)?|a(?:r(?:a(?:chut|glid)ing\.aero|ma\.it|ti\.se)|d(?:ov|u)a\.it|\.(?:it|gov\.pl|us)|ssenger-association\.aero|(?:lermo|via)\.it)|i(?:l(?:ot\.aero|a\.pl)|s(?:(?:toi)?a\.it|z\.pl)|(?:acenza)?\.it)|p\.(?:az|ru|se)|e(?:\.(?:ca|it|kr)|r(?:\.(?:nf|sg)|(?:so\.h|ugia\.i)t)|s(?:aro\-?urbino\.it|cara\.it))|o(?:l(?:\.(?:dz|ht)|kowice\.pl|tava\.ua)|r(?:s(?:ang(?:er|u)\.no|(?:áŋgu|grunn)\.no)|t\.fr|denone\.it)|\.(?:it|gov\.pl)|d(?:hal|lasi)e\.pl|mor(?:z|ski)e\.pl|tenza\.it|(?:wiat|znan)\.pl)|h(?:armacien\.fr)?|v(?:t\.ge|\.it)|l(?:c\.(?:co\.im|ly)|o\.ps|\.ua)?|u(?:(?:\.i|bl\.p)t|lawy\.pl)|c\.(?:it|pl)|t(?:\.it)?|n(?:\.it)?|[dgz]\.it|[fks])|b(?:a(?:l(?:l(?:ooning\.aer|angen\.n)o|s(?:an\.it|fjord\.no)|(?:estrand|at)\.no)|r(?:letta(?:andria|-andria-)trani\.it|i\.it|(?:(?:du|um)\.n|\.pr)o)|hcc?avuotna\.no|\.it|(?:mble|(?:jd|i)dar|daddja|tsfjord)\.no|bia-gora\.pl)?|r(?:o(?:nnoy(?:sund)?\.no|ker\.aero)|e(?:scia\.it|manger\.no)|ønnøy(?:sund)?\.no|(?:indisi)?\.it|(?:umunddal|yne)\.no)|i(?:z(?:\.(?:p[klr]|t[jt]|az|ki|mw|nr|vn))?|e(?:l(?:la\.it|awa\.pl)|v[aá]t\.no|szczady\.pl)|al(?:owieza|ystok)\.pl|\.it|(?:ndal|rkenes)\.no)?|e(?:r(?:g(?:amo\.it|(?:en)?\.no)|lev[aå]g\.no)|ar(?:alv[aá]hki\.no|du\.no)|(?:llun|nevent)o\.it|iarn\.no|(?:dzin|skidy)\.pl)?|g(?:\.it)?|j(?:ark[oø]y\.no|\.cn|(?:erkreim|ugn)\.no)?|o(?:l(?:t\.hu|(?:ogna|zano)\.it|eslawiec\.pl)|\.(?:it|(?:telemark|nordland)\.no)|d[oø]\.no|zen\.it|(?:kn|mlo)\.no)?|s(?:\.it)?|y(?:(?:gland|kle)\.no|(?:dgoszcz|tom)\.pl)?|z(?:\.it)?|u(?:dejju)?\.no|á(?:hcc?avuotna\.no|(?:lát|(?:jdda|idá)r)\.no)|å(?:dåddjå|tsfjord)\.no|ø(?:\.(?:telemark|nordland)\.no|mlo\.no)|[bfhmw]|c\.ca|[ln]\.it|ærum\.no|d\.se)|d(?:e(?:(?:sign\.aer|(?:p|atnu)\.n)o|\.us)?|r(?:a(?:mmen|ngedal)\.no|[oø]bak\.no)|o(?:n(?:na\.no|etsk\.ua)|vre\.no)|yr[oø]y\.no|avve(?:nj[aá]rga\.no|siida\.no)|i(?:vt(?:asvuod|tasvuot)na\.no|elddanuorri\.no)|n(?:(?:epropetrovsk)?\.ua|i\.us)|(?:gca\.aer|ønna\.n)o|[jkmz]|lugoleka\.pl|\.se|p\.ua|c\.us)|f(?:e(?:d(?:(?:eration\.aer|je\.n)o|\.us)|r(?:mo|rara)\.it|t(?:sund)?\.no|\.it)|l(?:or(?:ence\.it|[oøa]\.no)|a(?:kstad|tanger)?\.no|e(?:kkefjord|sberg)\.no|(?:ight\.aer|å\.n)o|\.us)|r(?:e(?:i(?:ght\.aer|\.n)o|drikstad\.no)|o(?:s(?:inone\.it|ta\.no)|m\.hr|(?:gn|land|ya)\.no)|\.it|(?:[aæ]n|øy)a\.no)?|u(?:o(?:ssko|isku)\.no|(?:el\.aer|sa\.n)o)|j(?:\.cn|(?:aler|ell)\.no)|i(?:n(?:n[oø]y\.no|\.ec)|r(?:m\.(?:ht|in|nf|ro)|enze\.it)|e\.ee|lm\.hu|\.it|tjar\.no)?|m(?:\.no)?|o(?:r(?:li\-?cesena\.it|um\.hu|(?:sand|de)\.no)|l(?:kebib|lda)l\.no|ggia\.it|snes\.no)?|y(?:lkesbib|resda)l\.no|a(?:(?:rsund|uske)\.no|m\.pk)|[gc]\.it|(?:hs|ørde)\.no|\.se)|h(?:a(?:\.(?:cn|no)|l(?:den|sa)\.no|m(?:ar(?:oy)?\.no|m(?:erfest|arfeasta)\.no)|r(?:am|(?:ei|sta)d)\.no|(?:nggliding\.aer|(?:(?:dse|ttfjellda)l|(?:bme|pmi)r|svik|(?:ugesun|gebosta)d)\.n)o)|o(?:tel\.(?:hu|lk)|b[oø]l\.no|l(?:t[aå]len\.no|(?:e|mestrand)?\.no)|r(?:nindal|ten)\.no|y(?:anger|landet)\.no|(?:mebuilt\.aer|(?:kksund|nefoss|f)\.n)o)|e(?:r(?:oy\.(?:more-og-romsdal|nordland)\.no|øy\.(?:møre-og-romsdal|nordland)\.no|ad\.no )|m(?:nes?\.no|sedal\.no)|(?:\.c|alth\.v)n)|i(?:\.(?:cn|us)|tra\.no)|l\.(?:cn|no)|n(?:\.cn)?|u(?:r(?:dal|um)\.no|issier-justice\.fr)?|m(?:\.no)?|ø(?:y(?:anger|landet)\.no|nefoss\.no)|á(?:(?:bme|pmi)r|mmárfeasta)\.no|j(?:artdal|elmeland)\.no|b\.cn|[krt]|(?:valer|(?:ylle|ægebo)stad|å)\.no|\.se)|i(?:n(?:t(?:\.(?:r[uw]|t[jt]|az|bo|is|lk|mw|pt|vn))?|f(?:o(?:\.(?:h[tu]|n[fr]|p[klr]|az|ec|ki|ro|sd|tt|vn))?|\.cu)|d(?:er[oø]y\.no|\.in)|surance\.aero|-addr\.arpa|gatlan\.hu|\.us)?|d(?:v\.(?:hk|tw)|\.(?:l[vy]|ir|us)|rett\.no)|m(?:(?:peria)?\.it)?|r(?:c\.pl)?|s(?:(?:ernia)?\.it|la\.pr|a\.us)?|v(?:(?:eland|gu)\.no|ano-frankivsk\.ua)|l(?:awa\.pl|\.us)|(?:p6\.arp|f\.u)a|z\.hr|(?:\.s)?e|(?:bestad\.n)?o|[qt]|a\.us)|j(?:o(?:urnal(?:ist)?\.aero|bs(?:\.tt)?|gasz\.hu|(?:rpeland|ndal|lster)\.no)?|e(?:(?:ssheim|vnaker)\.no|lenia-gora\.pl)?|a(?:n-mayen\.no|worzno\.pl)|ø(?:rpeland|lster)\.no|[lsx]\.cn|p|gora\.pl|ur\.pro)|l(?:e(?:a(?:sing\.aer|ngaviika\.n)o|cc[eo]\.it|i(?:r(?:vik|fjord)\.no|kanger\.no)|b(?:esby\.no|ork\.pl)|k(?:a|svik)\.no|\.it|(?:nvik|(?:a?gaviik|sj)a|vanger|rdal)\.no|(?:gnica|zajsk)\.pl)|o(?:di(?:\.it|ngen\.no)|ab[aá]t\.no|m(?:\.no|za\.pl)|(?:gistics\.aer|(?:ppa|renskog|ten)\.n)o|\.it|wicz\.pl)|t(?:d\.(?:gi|co\.im|lk)|\.it)?|a(?:ngev[aå]g\.no|r(?:vik|dal)\.no|va(?:ngen|gis)\.no|kas\.hu|(?:quil|\-?spezi|tin)a\.it|(?:(?:hppi|akesvuemie)\.n|w\.pr)o|py\.pl|\.us)?|c(?:\.it)?|i(?:er(?:ne)?\.no|lle(?:hammer|sand)\.no|nd(?:esne|[aå])s\.no|(?:vorno)?\.it|manowa\.pl)?|u(?:n(?:d|ner)\.no|r[oø]y\.no|(?:cca)?\.it|ster\.no|(?:bin|kow)\.pl|(?:gan|t)sk\.ua)?|g\.(?:jp|ua)|v(?:iv\.ua)?|y(?:ng(?:dal|en)\.no)?|ærdal(?:\.no)?|ø(?:(?:ding|t)en|renskog)\.no|n\.cn|[ks]|áhppi\.no)|r(?:e(?:c(?:\.(?:nf|ro)|reation\.aero)|s(?:\.(?:aero|in)|earch\.aero)|l\.(?:ht|pl)|ggio(?:-(?:calabr|emil)ia\.it|(?:calabr|emil)ia\.it)|\.(?:it|kr)|n(?:ne(?:s[oø]y\.no|bu\.no)|dalen\.no)|pbody\.aero|klam\.hu|alestate\.pl)?|o(?:m(?:s(?:kog|a)\.no|[ae]\.it)|v(?:igo\.it|no\.ua)|y(?:ken|rvik)\.no|(?:torcraft\.aer|(?:an|llag|doy|ros|st)\.n)o|\.it)?|a(?:h(?:olt|kkeravju)\.no|d(?:o(?:y\.no|m\.pl)|(?:øy|e)\.no)|n(?:a|daberg)\.no|(?:(?:gus|venn)a)?\.it|(?:(?:is|um)a|kkestad|lingen)\.no|wa-maz\.pl)|i(?:\.(?:it|us)|n(?:g(?:e(?:bu|rike)\.no|saker\.no)|dal\.no)|s(?:sa|[oø]r)\.no|(?:et|min)i\.it)|å(?:holt|de)\.no|á(?:hkkerávju|isa)\.no|u(?:ovat\.no)?|y(?:gge\.no|bnik\.pl)|ø(?:y(?:ken|rvik)\.no|(?:døy|mskog|ros|st)\.no)|(?:s\.b|v\.u)a|[gcnm]\.it|(?:l|ælingen)\.no|zeszow\.pl|w)|t(?:a(?:s\.(?:edu|gov)\.au|r(?:anto\.it|(?:gi|nobrzeg)\.pl)|na(?:nger)?\.no|xi\.aero|\.it)|r(?:a(?:d(?:er|ing)\.aero|n(?:[boø]y|a)\.no|vel(?:\.(?:pl|tt))?|iner\.aero|pani\.it)|\.(?:it|no)|e(?:nt(?:in)?o\.it|viso\.it)|o(?:ms[oøa]\.no|(?:ndheim|andin|gstad)\.no)|ieste\.it|(?:ysil|æna|øgstad)\.no)|v(?:\.(?:bo|it|sd)|edestrand\.no)?|j(?:\.cn|(?:eldsund|[oø]me)\.no)?|m(?:\.(?:m[cg]|fr|hu|[nr]o|pl|se))?|o(?:r(?:ino\.it|sken\.no)|zsde\.hu|\.it|(?:kke|lga|nsberg)\.no|urism\.pl)?|e(?:r(?:n(?:i\.it|opil\.ua)|amo\.it)|\.(?:it|ua))|ur(?:in\.it|(?:ystyka|ek)\.pl)|n(?:\.(?:it|us))?|i(?:n(?:gvoll|n)\.no|me\.no)|y(?:s(?:v[aæ]r\.no|(?:fjord|nes)\.no)|(?:dal|nset)\.no|chy\.pl)|g(?:ory\.pl)?|(?:[ps]\.i)?t|ønsberg\.no|\.se|[cdfklw]|x\.us)|u(?:n(?:j[aá]rga\.no|ion\.aero|(?:sa|bi)\.ba)|r[in]\.arpa|t(?:azas\.hu|sira\.no|\.us)|d(?:ine)?\.it|l(?:lens(?:aker|vang)\.no|vik\.no)|g(?:\.gov\.pl)?|s(?:(?:enet|tka)\.pl)?|z(?:(?:hgorod)?\.ua)?|(?:(?:po)?w|m)\.gov\.pl|\.se|a)|w(?:o(?:rk(?:inggroup|s)\.aero|(?:dzislaw|lomin)\.pl)|a(?:\.(?:(?:edu|gov)\.au|us)|r(?:mi|szaw)a\.pl|(?:lbrzych|w)\.pl)|e(?:b\.(?:[lp]k|nf|tj)|grow\.pl)|i(?:elun\.pl|\.us)|locl(?:awek)?\.pl|roc(?:law)?\.pl|ww\.ro|\.se|(?:[vy]\.u)?s)|[^\.]+\.(?:a(?:[ru]|(?:(?:ich|omor)i|kita)\.jp)|b[dnrt]|c(?:[kory]|hiba\.jp)|e(?:[grt]|hime\.jp)|f(?:uku(?:i|(?:ok|shim)a)\.jp|[jk])|g(?:u(?:nma\.jp)?|[hnt]|ifu\.jp)|i(?:[dl]|(?:baraki|shikawa|wate)\.jp)|h(?:iroshima|(?:okkaid|yog)o)\.jp|k(?:a(?:g(?:aw|oshim)a\.jp|(?:nagawa|wasaki)\.jp)|o(?:be|chi)\.jp|(?:itakyushu|(?:umam|y)oto)\.jp|[ehw])|m(?:i(?:ya(?:g|zak)i\.jp|e\.jp)|[lmtvxyz])|n(?:a(?:g(?:a(?:no|saki)\.jp|oya\.jp)|ra\.jp)|i(?:igata\.jp)?|[pz])|o(?:k(?:ayam|inaw)a\.jp|(?:it|sak)a\.jp|m)|s(?:a(?:(?:(?:g|itam)a|pporo)\.jp)?|hi(?:(?:g|zuok)a|mane)\.jp|endai\.jp|[bvy]|ch\.uk)|t(?:o(?:k(?:ushima|yo)\.jp|(?:(?:chig|ttor)i|yama)\.jp)|[hrz])|y(?:ama(?:g(?:ata|uchi)\.jp|nashi\.jp)|okohama\.jp|[eu])|l[br]|p[aegwy]|u[ky]|z[amw]|do|jm|wakayama\.jp|qa|ve)|q(?:ld\.(?:edu|gov)\.au|c\.ca|h\.cn)|v(?:i(?:c(?:\.(?:edu|gov)\.au|enza\.it)|bo\-?valentia\.it|k(?:na)?\.no|n(?:dafjord\.no|nica\.ua)|deo\.hu|(?:terbo)?\.it)?|e(?:n(?:(?:ezia|ice)\.it|nesla\.no)|r(?:(?:(?:bani|on)a|celli)\.it|(?:dal|ran)\.no)|g(?:a(?:rshei)?\.no|årshei\.no)|st(?:re-(?:slidre|toten)\.no|v(?:ago|ågø)y\.no|(?:by|nes)\.no)|terinaire\.fr|\.it|(?:fsn|velstad)\.no)|a(?:r(?:d[oø]\.no|ese\.it|(?:ggat|oy)\.no)|\.(?:it|no|us)|ds[oø]\.no|l(?:er\.(?:ostfold|hedmark)\.no|le\.no)|n(?:g|ylven)\.no|g(?:an?\.no|soy\.no)|(?:ksdal|apste)\.no)?|c(?:\.it)?|t\.(?:it|us)|g(?:s\.no)?|o(?:ss(?:evangen)?\.no|(?:lda|agat)\.no)|å(?:g(?:an|søy|å)\.no|ler\.(?:østfold|hedmark)\.no)|n(?:\.ua)?|[brv]\.it|(?:f|árggát|ærøy)\.no|u)|y(?:k\.ca|n\.cn|\.se)|x(?:[jz]\.cn|\.se)|z(?:a(?:(?:chpomor|gan|row|kopane)\.pl|porizhzhe\.ua)|gor(?:a\.pl|zelec\.pl )|j\.cn|\.se|(?:[pt]|hitomir)\.ua)|k(?:o(?:n(?:gs(?:berg|vinger)\.no|yvelo\.hu|(?:in|skowola)\.pl)|(?:mmune|pervik)\.no|(?:bierzyce|lobrzeg)\.pl)|r(?:\.(?:it|ua)|o(?:kstadelva|dsherad)\.no|a(?:ger[oø]\.no|anghke\.no|kow\.pl)|istians[au]nd\.no|(?:åanghke|ødsherad)\.no)?|i(?:r(?:kenes\.no|ovograd\.ua)|ev\.ua|ds\.us)?|m(?:\.ua)?|y(?:\.us)?|a(?:r(?:asjo(?:k|hka)\.no|m[oø]y\.no|lsoy\.no|(?:pacz|tuzy)\.pl)|(?:utokeino|fjord)\.no|(?:lisz|(?:zimierz-doln|szub)y|towice)\.pl)|l(?:(?:epp|[aæ]bu)\.no|odzko\.pl)|v(?:a(?:(?:lsun|fjor)d|m|nangen)\.no|i(?:n(?:esdal|nherad)\.no|t(?:s[oø]y\.no|eseid\.no))|æ(?:fjord|nangen)\.no)|e(?:pno|trzyn)\.pl|h(?:arkov|erson)?\.ua|s\.u[as]|[gnz]|(?:árášjohka|åfjord)\.no|utno\.pl|\.se)|å(?:l(?:(?:går|esun)d)?\.no|m(?:li|ot)\.no|s(?:eral|nes)?\.no|(?:krehamn|fjord|rdal)\.no)|á(?:l(?:tá|aheadju)\.no|kŋoluokta\.no)|ø(?:r(?:s(?:kog|ta)\.no|land\.no)|y(?:er|garden|stre-slidre)\.no|(?:stre-toten|vre-eiker)\.no)|2000\.hu|한글\.kr|`øksnes\.no|6bone\.pl|(?:網路|組織|商業)\.tw)$/
  ,
  _tldEx: /(?:\.|^)(?:c(?:ity\.(?:k(?:awasaki|itakyushu|obe|yoto)\.jp|s(?:a(?:itama|pporo)\.jp|(?:endai|hizuoka)\.jp)|(?:chib|(?:fukuo|osa)k|(?:hiroshi|yokoha)m|nagoy)a\.jp)|ongresodelalengua3\.ar)|me(?:con\.ar|tro\.tokyo\.jp)|n(?:a(?:cion\.ar|tional-library-scotland\.uk)|ic\.ar|(?:el|ls)\.uk)|p(?:r(?:ef\.(?:a(?:(?:ich|omor)i|kita)\.jp|fuku(?:i|(?:ok|shim)a)\.jp|g(?:ifu|unma)\.jp|h(?:iroshima|(?:okkaid|yog)o)\.jp|i(?:baraki|shikawa|wate)\.jp|k(?:a(?:g(?:aw|oshim)a\.jp|nagawa\.jp)|(?:ochi|(?:umam|y)oto)\.jp)|mi(?:ya(?:g|zak)i\.jp|e\.jp)|n(?:a(?:ga(?:no|saki)\.jp|ra\.jp)|iigata\.jp)|o(?:k(?:ayam|inaw)a\.jp|(?:it|sak)a\.jp)|s(?:a(?:g|itam)a\.jp|hi(?:(?:g|zuok)a|mane)\.jp)|to(?:(?:chig|ttor)i|(?:kushi|ya)ma)\.jp|yama(?:g(?:ata|uchi)\.jp|nashi\.jp)|(?:(?:chib|wakayam)a|ehime)\.jp)|omocion\.ar)|arliament\.uk)|b(?:l|ritish-library)\.uk|(?:educ|gobiernoelectronico|(?:retin|ub)a)\.ar|(?:icn|j)et\.uk)$/
}