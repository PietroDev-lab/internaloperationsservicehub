-- -- -- -- -- -- -- -- -- -- -- -- -- 
title : Critique on Emilio's project :
--- --- --- --- --- --- --- --- --- ---

*(1)* His biggest problem in that he has changed the scope :

MY project :
- Employee submits requests -> HR recieves it -> HR priorities , processes , responds and closes it .

His project :
- Employee describes a problem -> AI understands it -> AI determines department -> AI routes it -> department handles it .

- My main problem was getting a reply / answer from the HR . Meanwhile for him it was not knowing which department to contact which itself is a problem maybe new employees at a big company face , however it is not something an internal operations service hub is made for .

- His problem is fixed with time , with knowing the company and the departments and supervisors later , or even by asking a team leader. So the whole Internal operation service hub is not necessary for this case / problem .

*(2)* His actors are too broad while mine are focused on the main relationship : Employee <-> HR .

*(3)* His functional requirements are more ambitious than mine .

- He wants to implement a pretty substantial AI feature set , which isn't straightforward and doesn't directly address the HR workload problem .

*(4)* His NFRs are weaker than mine .

- "response should feel near-instant (seconds , not minutes)" : that's too vague .

- "should handle requests accross the whole company" : it is not measurable .

*(5)* His non-goals contains something contradictory : "No AI driven decision-making beyond classification / routing" but the entire core of his system is AI classification / routing .

# Critique on architecture :

** MASSIVE Error**

Used AI in the project