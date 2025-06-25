import requests
from bs4 import BeautifulSoup





def getLangaraCourseSubjects(year:int, term:int)-> list | None:
    courseURL = "https://swing.langara.bc.ca/prod/hzgkfcls.P_Sel_Crse_Search?term={year}{term}"
    session = requests.Session()
    response = session.post(courseURL)

    soup = BeautifulSoup(response.text, "lxml")

    courses = soup.find_all("select", {"id": "subj_id"})
    courses = courses.findChildren()

    subjects = []
    for course in courses:
        subjects.append(str(course).split('"')[1])

    if lens(subjects) == 0:
        raise Exception("No courses found. Please check the URL or the term/year provided.")
        
    
    return subjects

print(getLangaraCourseSubjects(2025,30))