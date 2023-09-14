main_file = "index-mobile"
with open(main_file+'.html', 'r') as file:
    main_data = file.read()
    tabs = ["LabelTab", "StockTab", "TotalTab"]
    for tab in tabs:
        with open(tab+'.js', 'r') as js:
            js_data = js.read()

            with open(tab+'.html', 'r') as html:
                html_data = html.read()
                with open(r'stocktab.css', 'r') as stock_css:
                    stock_css_data = stock_css.read()
                js_data = js_data.replace("import stylesheet from './stocktab.css' assert { type: 'css' };", "var sheet = new CSSStyleSheet();sheet.replace(`" + stock_css_data + "`)")
                js_data = js_data.replace(" = [stylesheet]", ".push(sheet)")
                js_data = js_data.replace("let res = await fetch( '" + tab + ".html' )", "`" + html_data + "`")
                js_data = js_data.replace("await res.text()", "`" + html_data + "`")


            js_data = "<script type=\"module\">" + js_data + "</script>"

            main_data = main_data.replace("<script src=\"" + tab + ".js\" type=\"module\"></script>", js_data)

    with open(main_file+'.css', 'r') as index_css:
        index_css_data = index_css.read()
        main_data = main_data.replace("<link rel=\"stylesheet\" href=\""+main_file+".css\">", "<style>" + index_css_data + "</style>")

    with open(r'StockTicker-mobile.html', 'w') as output_file:
        output_file.write(main_data)