  CREATE TABLE TBL_APPLICATION_TOUR 
   (	
    ID              NUMBER,  
	APP_ID          NUMBER CONSTRAINT APT_APP_ID_NN NOT NULL ENABLE, 
	PAGE_ID         NUMBER CONSTRAINT APT_PAGE_ID_NN NOT NULL ENABLE, 
	PRIORITY        NUMBER CONSTRAINT APT_PRIORITY_NN NOT NULL ENABLE, 
	CSS_CLASS       VARCHAR2(5) CONSTRAINT APT_CSS_CLASS_NN NOT NULL ENABLE, 
	TOUR_TITLE      VARCHAR2(500), 
	TOUR_TEXT       VARCHAR2(500), 
	CREATED_BY      VARCHAR2(20), 
	CREATED_DATE    DATE, 
	UPDATED_BY      VARCHAR2(20), 
	UPDATED_DATE    DATE, 
	CONSTRAINT PK_APPLICATION_TOUR PRIMARY KEY (ID), 
	CONSTRAINT U_APP_ID_PAGE_ID_PRIORITY UNIQUE (PRIORITY, PAGE_ID, APP_ID)
   );


   COMMENT ON COLUMN TBL_APPLICATION_TOUR.ID IS 'Primary key';
   COMMENT ON COLUMN TBL_APPLICATION_TOUR.APP_ID IS 'Application id';
   COMMENT ON COLUMN TBL_APPLICATION_TOUR.PAGE_ID IS 'Application page id ';
   COMMENT ON COLUMN TBL_APPLICATION_TOUR.PRIORITY IS 'Priority';
   COMMENT ON COLUMN TBL_APPLICATION_TOUR.CSS_CLASS IS 'Css class';
   COMMENT ON COLUMN TBL_APPLICATION_TOUR.TOUR_TITLE IS 'Title Of Tour';
   COMMENT ON COLUMN TBL_APPLICATION_TOUR.TOUR_TEXT IS 'Description';
   COMMENT ON TABLE TBL_APPLICATION_TOUR  IS 'This tabla just created for dynamic tour guid into the oracle apex with minimum code';

create sequence seq_application_tour start with 1 nocache nocycle order; 

CREATE OR REPLACE TRIGGER TRG_APPLICATION_TOUR_BIU 
before insert or update 
on TBL_APPLICATION_TOUR
for each row 

begin 
    if inserting then 
        :new.id := seq_application_tour.nextval;
        
            select  nvl(max(priority),0)+1
            into    :new.priority
            from    TBL_APPLICATION_TOUR
            where   app_id = :new.app_id
            and     page_id = :new.page_id;

        :new.created_by := nvl(v('APP_USER'),user);
        :new.created_date := sysdate;

        :new.css_class := 'stp'||:new.priority;
    end if;

    if updating then 
        :new.updated_by := nvl(v('APP_USER'),user);
        :new.updated_date := sysdate;
    end if;        
end;
/
ALTER TRIGGER TRG_APPLICATION_TOUR_BIU ENABLE;