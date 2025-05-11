# Oracle-APEX-Application-Tour-Guide-shepherd-Library

#upload four file below into the Static Workspace Files
dynamicTourGuiedDS.js
shepherd-theme-dark.css
shepherd.min.js
tether.min.js

# run Application tour table.sql file

# go to the navigation bar and add new entry
Image/Class       : fa-info-circle;
List Entry Label  : &nbsp;
Target type       : URL;
URL Target        : javascript:startTour('shepherd-theme-dark');
Condition Type    : Exists(SQL query returns at least on row);
Expression 1      : select 1 
                    from   tb_application_tour 
                    where  app_id = :app_id 
                    and    page_id = :app_page_id;

# Going into the page if that have applicatour and adding ajax proccess 
Name : applicationTour;
Type : Execute Code;
PL/SQL Code : 
  BEGIN
    APEX_JSON.initialize_clob_output;
    DECLARE
        tour SYS_REFCURSOR;
    BEGIN
        OPEN tour FOR
            SELECT COALESCE(tour_title, 'No title') AS tour_title,
                   COALESCE(tour_text, 'No description') AS tour_text
            FROM tb_application_tour
            WHERE app_id = :app_id 
            AND page_id =  :app_page_id
            AND css_class = apex_application.g_x01;
        APEX_JSON.write(tour);
    END;
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;


#any item you want have tour add css class
add specific css class for that item from table TBL_APPLICATION_TOUR
Now you can run page and check your application tour
